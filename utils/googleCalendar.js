import { google } from 'googleapis';
import { randomUUID } from 'node:crypto';
import {
  GOOGLE_CALENDAR_ID,
  GOOGLE_CALENDAR_OAUTH_CLIENT_ID,
  GOOGLE_CALENDAR_OAUTH_CLIENT_SECRET,
  GOOGLE_CALENDAR_OAUTH_REFRESH_TOKEN,
} from '../config.js';

let calendarClient;

export const isGoogleCalendarConfigured = () => Boolean(
  GOOGLE_CALENDAR_ID
    && GOOGLE_CALENDAR_OAUTH_CLIENT_ID
    && GOOGLE_CALENDAR_OAUTH_CLIENT_SECRET
    && GOOGLE_CALENDAR_OAUTH_REFRESH_TOKEN,
);

const getCalendarClient = () => {
  if (!isGoogleCalendarConfigured()) {
    throw new Error('Google Calendar integration is not configured');
  }

  if (!calendarClient) {
    const auth = new google.auth.OAuth2(
      GOOGLE_CALENDAR_OAUTH_CLIENT_ID,
      GOOGLE_CALENDAR_OAUTH_CLIENT_SECRET,
    );
    auth.setCredentials({ refresh_token: GOOGLE_CALENDAR_OAUTH_REFRESH_TOKEN });
    calendarClient = google.calendar({ version: 'v3', auth });
  }

  return calendarClient;
};

export const getCalendarBusyPeriods = async (start, end, timezone) => {
  if (!isGoogleCalendarConfigured()) return [];

  const calendar = getCalendarClient();
  const { data } = await calendar.freebusy.query({
    requestBody: {
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      timeZone: timezone,
      items: [{ id: GOOGLE_CALENDAR_ID }],
    },
  });

  const calendarData = data.calendars?.[GOOGLE_CALENDAR_ID];
  if (!calendarData || calendarData.errors?.length) {
    throw new Error('Unable to read availability from the configured Google Calendar');
  }

  return calendarData.busy || [];
};

export const createCalendarBooking = async ({ startAt, endAt, timezone }) => {
  if (!isGoogleCalendarConfigured()) return null;

  const calendar = getCalendarClient();
  const { data: insertedEvent } = await calendar.events.insert({
    calendarId: GOOGLE_CALENDAR_ID,
    requestBody: {
      summary: 'Portfolio meeting',
      description: 'Meeting booked through artemlira.com.',
      start: { dateTime: startAt.toISOString(), timeZone: timezone },
      end: { dateTime: endAt.toISOString(), timeZone: timezone },
      conferenceData: {
        createRequest: {
          requestId: randomUUID(),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
    sendUpdates: 'none',
    conferenceDataVersion: 1,
  });

  if (!insertedEvent.id) throw new Error('Google Calendar did not return an event ID');
  let event = insertedEvent;
  const cleanupInsertedEvent = async () => {
    try {
      await calendar.events.delete({ calendarId: GOOGLE_CALENDAR_ID, eventId: insertedEvent.id, sendUpdates: 'none' });
    } catch (error) {
      console.error('Google Calendar cleanup failed after Meet generation error', error);
    }
  };

  try {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const meetUrl = event.hangoutLink || event.conferenceData?.entryPoints?.find(({ entryPointType }) => entryPointType === 'video')?.uri;
      if (meetUrl) return { eventId: event.id, meetUrl };
      if (event.conferenceData?.createRequest?.status?.statusCode === 'failure') break;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const { data } = await calendar.events.get({ calendarId: GOOGLE_CALENDAR_ID, eventId: event.id });
      event = data;
    }
  } catch (error) {
    await cleanupInsertedEvent();
    throw error;
  }

  await cleanupInsertedEvent();
  throw new Error('Google Calendar did not return a Google Meet link');
};

export const deleteCalendarBooking = async (eventId) => {
  if (!eventId) return;
  if (!isGoogleCalendarConfigured()) {
    throw new Error('Google Calendar integration is not configured for this booking');
  }

  const calendar = getCalendarClient();
  try {
    await calendar.events.delete({ calendarId: GOOGLE_CALENDAR_ID, eventId, sendUpdates: 'none' });
  } catch (error) {
    if (error?.code !== 404 && error?.code !== 410) throw error;
  }
};
