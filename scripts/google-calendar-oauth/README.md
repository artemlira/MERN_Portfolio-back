# One-time Google Calendar OAuth authorization

This local helper exchanges Google's authorization code for a refresh token. It binds only to `127.0.0.1:53682`, verifies OAuth state, and does not save credentials to disk. The refresh token is printed in the terminal so it can be copied straight into Hostinger. Keep it private.

Before running it, create a Google OAuth client ID of type **Web application** and add this exact authorized redirect URI:

```text
http://localhost:53682/oauth2callback
```

Then run it from this repository in a terminal. Provide the client credentials as shell environment variables; do not put them in `.env`, source files, or command history:

```sh
read -r -p 'OAuth client ID: ' GOOGLE_CALENDAR_OAUTH_CLIENT_ID
read -r -s -p 'OAuth client secret: ' GOOGLE_CALENDAR_OAUTH_CLIENT_SECRET
printf '\n'
export GOOGLE_CALENDAR_OAUTH_CLIENT_ID GOOGLE_CALENDAR_OAUTH_CLIENT_SECRET
node scripts/google-calendar-oauth/authorize.js
unset GOOGLE_CALENDAR_OAUTH_CLIENT_ID GOOGLE_CALENDAR_OAUTH_CLIENT_SECRET
```

Sign in with the Google account that owns the Portfolio bookings calendar and approve Calendar access. Copy the refresh token from the terminal directly to Hostinger's `GOOGLE_CALENDAR_OAUTH_REFRESH_TOKEN` environment setting. Set the same client ID and client secret as `GOOGLE_CALENDAR_OAUTH_CLIENT_ID` and `GOOGLE_CALENDAR_OAUTH_CLIENT_SECRET`, plus the calendar's ID as `GOOGLE_CALENDAR_ID`.

The client requests the `calendar.events.freebusy` and `calendar.events` scopes. This supports checking calendar availability and creating, reading back, and deleting appointment events, including Meet conference links.
