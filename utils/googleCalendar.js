import { google } from 'googleapis';
import {
  GOOGLE_CALENDAR_ID,
  GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON,
} from '../config.js';

const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events.freebusy',
  'https://www.googleapis.com/auth/calendar.events',
];

let calendarClient;

export const isGoogleCalendarConfigured = () => Boolean(
  GOOGLE_CALENDAR_ID && GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON,
);

const getCalendarClient = () => {
  if (!isGoogleCalendarConfigured()) {
    throw new Error('Google Calendar integration is not configured');
  }

  if (!calendarClient) {
    let credentials;
    try {
      credentials = JSON.parse(GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON);
    } catch {
      throw new Error('GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON must contain valid JSON');
    }

    const auth = new google.auth.GoogleAuth({ credentials, scopes: CALENDAR_SCOPES });
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
  const { data } = await calendar.events.insert({
    calendarId: GOOGLE_CALENDAR_ID,
    requestBody: {
      summary: 'Portfolio meeting',
      description: 'Meeting booked through artemlira.com.',
      start: { dateTime: startAt.toISOString(), timeZone: timezone },
      end: { dateTime: endAt.toISOString(), timeZone: timezone },
    },
    sendUpdates: 'none',
  });

  if (!data.id) throw new Error('Google Calendar did not return an event ID');
  return data.id;
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
