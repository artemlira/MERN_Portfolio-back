# Booking setup

The portfolio uses this API to list bookable times and store appointments in MongoDB. Booking settings are optional; defaults are shown in `.env.example`.

`BOOKING_TIMEZONE` is an IANA timezone name. `BOOKING_DURATION_MINUTES` sets the meeting length. `BOOKING_MINIMUM_NOTICE_HOURS` sets the minimum lead time. `BOOKING_WINDOW_DAYS` sets how far ahead visitors can book.

`BOOKING_WEEKLY_HOURS` maps weekday numbers to local opening and closing times. Sunday is `0`, Monday is `1`, and Saturday is `6`. For example, weekdays from 10:00 to 16:00:

```env
BOOKING_WEEKLY_HOURS={"1":["10:00","16:00"],"2":["10:00","16:00"],"3":["10:00","16:00"],"4":["10:00","16:00"],"5":["10:00","16:00"]}
```

The public booking flow is on the portfolio's Contacts page and homepage. After signing in, the owner can view or cancel appointments at `/bookings/manage`.

Bookings are stored in MongoDB. When SMTP is configured, the API sends a notification to `CONTACT_TO_EMAIL` and a confirmation to the visitor. If email delivery is unavailable, the booking is still stored and the API reports `notificationSent: false`; check the API logs and protected booking manager.

## Google Calendar sync

When both `GOOGLE_CALENDAR_ID` and `GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON` are configured, the API checks Google Calendar free/busy before returning available slots, creates a calendar event for each booking, and deletes that event when the booking is cancelled. Calendar events contain only the generic title `Portfolio meeting` and do not copy the visitor's name, email, or note. If Calendar is configured but unavailable, the API does not offer unchecked slots or confirm a booking without its calendar event.

To connect a Google Calendar:

1. In Google Cloud Console, create a project and enable the Google Calendar API.
2. Create a service account and a JSON key. Keep the key private; never commit it or send it in chat.
3. In Google Calendar, share the target calendar with the service account's email address and grant **Make changes to events**.
4. In Hostinger's Node.js app environment settings, set `GOOGLE_CALENDAR_ID` to `artemliradev@gmail.com` (or the calendar ID shown in Google Calendar settings) and set `GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON` to the complete JSON key contents.
5. For email, set `CONTACT_TO_EMAIL` to the desired inbox. The configured Hostinger mailbox remains the sender; set `SMTP_USER` and `MAIL_FROM` to that mailbox and add its password as `SMTP_PASS` directly in Hostinger.

Calendar integration uses `calendar.events.freebusy` for availability and `calendar.events` for creating and deleting events on the calendar shared with the service account. Although Google's write scope can access event details on calendars available to that account, this integration only calls the free/busy endpoint and writes generic portfolio meeting events; it never lists or reads event details. Keep the service account shared only on the calendar used for bookings.
