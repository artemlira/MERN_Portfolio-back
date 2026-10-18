# Booking setup

The portfolio uses this API to list bookable times and store appointments in MongoDB. Booking settings are optional; defaults are shown in `.env.example`.

`BOOKING_TIMEZONE` is an IANA timezone name. `BOOKING_DURATION_MINUTES` sets the meeting length. `BOOKING_MINIMUM_NOTICE_HOURS` sets the minimum lead time. `BOOKING_WINDOW_DAYS` sets how far ahead visitors can book.

`BOOKING_WEEKLY_HOURS` maps weekday numbers to local opening and closing times. Sunday is `0`, Monday is `1`, and Saturday is `6`. For example, weekdays from 10:00 to 16:00:

```env
BOOKING_WEEKLY_HOURS={"1":["10:00","16:00"],"2":["10:00","16:00"],"3":["10:00","16:00"],"4":["10:00","16:00"],"5":["10:00","16:00"]}
```

The public booking flow is on the portfolio's Contacts page and homepage. After signing in, the owner can view or cancel appointments at `/bookings/manage`.

Bookings are stored in MongoDB. When SMTP is configured, the API sends a notification to `CONTACT_TO_EMAIL` and a confirmation to the visitor. If email delivery is unavailable, the booking is still stored and the API reports `notificationSent: false`; check the API logs and protected booking manager. Keep the configured availability aligned with the owner's calendar manually; this version does not sync an external calendar.

For Hostinger, add the SMTP variables from `.env.example` in the Node.js app's environment settings. Do not commit mailbox credentials.
