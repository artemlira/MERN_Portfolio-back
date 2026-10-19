# Booking setup

The portfolio uses this API to list bookable times and store appointments in MongoDB. Booking settings are optional; defaults are shown in `.env.example`.

`BOOKING_TIMEZONE` is an IANA timezone name. `BOOKING_DURATION_MINUTES` sets the meeting length. `BOOKING_MINIMUM_NOTICE_HOURS` sets the minimum lead time. `BOOKING_WINDOW_DAYS` sets how far ahead visitors can book.

`BOOKING_WEEKLY_HOURS` maps weekday numbers to local opening and closing times. Sunday is `0`, Monday is `1`, and Saturday is `6`. For example, weekdays from 10:00 to 16:00:

```env
BOOKING_WEEKLY_HOURS={"1":["10:00","16:00"],"2":["10:00","16:00"],"3":["10:00","16:00"],"4":["10:00","16:00"],"5":["10:00","16:00"]}
```

The public booking flow is on the portfolio's Contacts page and homepage. After signing in, the owner can view or cancel appointments at `/bookings/manage`.

Bookings are stored in MongoDB. Each booking gets a unique Google Meet conference, and the visitor receives its URL by email. The email links to a page where the visitor can confirm or decline attendance; their response is recorded in MongoDB and shown in the protected booking manager. The response link is single-use and expires when the meeting starts. When SMTP is configured, the API sends a notification to `CONTACT_TO_EMAIL` and a confirmation to the visitor. If email delivery is unavailable, the booking is still stored and the API reports `notificationSent: false`; check the API logs and protected booking manager.

## Google Calendar sync

When `GOOGLE_CALENDAR_ID` and all three Google OAuth variables are configured, the API checks Google Calendar free/busy before returning available slots, creates a calendar event and a unique Google Meet conference for each booking, and deletes that event when the booking is cancelled. Calendar events contain only the generic title `Portfolio meeting` and do not copy the visitor's name, email, or note. The API waits for Google's asynchronous conference generation to finish before confirming a booking. If Calendar is configured but unavailable, or Google Meet cannot be generated, the API does not offer unchecked slots or confirm a booking without the calendar event and Meet URL.

To connect a Google Calendar:

1. In Google Cloud Console, enable the Google Calendar API and configure the OAuth consent screen for the Google account that owns the target calendar. Set the app to **In production** before issuing the refresh token; Google's test-mode refresh tokens for external apps can expire after seven days.
2. Create an OAuth client ID for a **Web application**. Use the redirect URI `http://localhost:53682/oauth2callback` for the one-time local authorization flow. Keep the client secret private.
3. Run the backend's one-time OAuth setup utility locally with the OAuth client ID and secret. Sign in as the Google account that owns the target calendar and grant the requested Calendar access. Copy the resulting refresh token directly into Hostinger; do not commit it or send it in chat. The utility is described in `scripts/google-calendar-oauth/README.md`.
4. In Hostinger's Node.js app environment settings, set `GOOGLE_CALENDAR_ID` to the target calendar ID (for example `artemliradev@gmail.com`) and add `GOOGLE_CALENDAR_OAUTH_CLIENT_ID`, `GOOGLE_CALENDAR_OAUTH_CLIENT_SECRET`, and `GOOGLE_CALENDAR_OAUTH_REFRESH_TOKEN`.
5. For email, set `CONTACT_TO_EMAIL` to the desired inbox. The configured Hostinger mailbox remains the sender; set `SMTP_USER` and `MAIL_FROM` to that mailbox and add its password as `SMTP_PASS` directly in Hostinger.
6. Set `PUBLIC_SITE_URL` to the public portfolio origin used in confirmation links. It defaults to `https://artemlira.com`.

Calendar integration requests Google's `calendar.events.freebusy` and `calendar.events` scopes. These grant the API access to availability and event details/changes for calendars available to the authorized Google account. The integration uses free/busy for availability, writes generic portfolio meeting events, reads back the newly created event to retrieve its Meet link, and deletes portfolio events when cancelled. The refresh token and client secret must remain private and be stored only in Hostinger's environment settings and the local OAuth setup environment.
