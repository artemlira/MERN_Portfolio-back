import BookingModel from '../models/Booking.js';
import { isEmailConfigured, sendBookingNotifications } from '../utils/email.js';
import {
  createCalendarBooking,
  deleteCalendarBooking,
  getCalendarBusyPeriods,
  isGoogleCalendarConfigured,
} from '../utils/googleCalendar.js';
import {
  BOOKING_DURATION_MINUTES as durationMinutes,
  BOOKING_MINIMUM_NOTICE_HOURS as minimumNoticeHours,
  BOOKING_TIMEZONE as timezone,
  BOOKING_WEEKLY_HOURS as weeklyHours,
  BOOKING_WINDOW_DAYS as bookingWindowDays,
} from '../config.js';
const timezoneFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: timezone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const getZonedParts = (date) => Object.fromEntries(
  timezoneFormatter.formatToParts(date).filter(({ type }) => type !== 'literal').map(({ type, value }) => [type, Number(value)]),
);

const localTimeToUtc = (dateString, timeString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const [hour, minute] = timeString.split(':').map(Number);
  const target = Date.UTC(year, month - 1, day, hour, minute);
  let guess = target;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = getZonedParts(new Date(guess));
    const represented = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
    guess += target - represented;
  }

  const result = new Date(guess);
  const parts = getZonedParts(result);
  if (
    parts.year !== year || parts.month !== month || parts.day !== day ||
    parts.hour !== hour || parts.minute !== minute
  ) return null;
  return result;
};

const getDayOfWeek = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
};

const getSlotsForDate = async (dateString, knownBookedStarts = null, knownBusyPeriods = null) => {
  const hours = weeklyHours[getDayOfWeek(dateString)];
  if (
    !Array.isArray(hours) ||
    hours.length !== 2 ||
    hours.some((time) => typeof time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
  ) return [];

  const [openTime, closeTime] = hours;
  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);
  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;
  if (closeMinutes <= openMinutes || durationMinutes < 10 || durationMinutes > 240) return [];

  const slots = [];
  for (let minute = openMinutes; minute + durationMinutes <= closeMinutes; minute += durationMinutes) {
    const hourText = String(Math.floor(minute / 60)).padStart(2, '0');
    const minuteText = String(minute % 60).padStart(2, '0');
    const start = localTimeToUtc(dateString, `${hourText}:${minuteText}`);
    if (!start || start.getTime() < Date.now() + minimumNoticeHours * 60 * 60 * 1000) continue;
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
    slots.push({ startAt: start.toISOString(), endAt: end.toISOString(), label: `${hourText}:${minuteText}` });
  }

  if (!slots.length) return [];
  const startAt = new Date(slots[0].startAt);
  const endAt = new Date(slots[slots.length - 1].endAt);
  const bookedStarts = knownBookedStarts || new Set(
    (await BookingModel.find({ startAt: { $gte: startAt, $lte: endAt } }).select('startAt').lean())
      .map((booking) => new Date(booking.startAt).toISOString()),
  );
  const busyPeriods = knownBusyPeriods || await getCalendarBusyPeriods(startAt, endAt, timezone);
  return slots.filter((slot) => {
    if (bookedStarts.has(slot.startAt)) return false;
    const slotStart = Date.parse(slot.startAt);
    const slotEnd = Date.parse(slot.endAt);
    return !busyPeriods.some(({ start, end }) => Date.parse(start) < slotEnd && Date.parse(end) > slotStart);
  });
};

const isValidDateString = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

export const getConfig = (_req, res) => {
  res.json({ timezone, durationMinutes, bookingWindowDays });
};

export const getAvailability = async (req, res) => {
  const { date, month } = req.query;
  if (month !== undefined) {
    if (typeof month !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return res.status(400).json({ message: 'Оберіть коректний місяць.' });
    }

    const [year, monthNumber] = month.split('-').map(Number);
    const dayCount = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
    const todayParts = getZonedParts(new Date());
    const todayDate = `${todayParts.year}-${String(todayParts.month).padStart(2, '0')}-${String(todayParts.day).padStart(2, '0')}`;
    const lastDate = new Date(Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day + bookingWindowDays));
    const lastBookableDate = `${lastDate.getUTCFullYear()}-${String(lastDate.getUTCMonth() + 1).padStart(2, '0')}-${String(lastDate.getUTCDate()).padStart(2, '0')}`;
    const dayDates = Array.from({ length: dayCount }, (_, index) =>
      `${month}-${String(index + 1).padStart(2, '0')}`,
    );
    const bookableDates = dayDates.filter((item) => item >= todayDate && item <= lastBookableDate);
    if (!bookableDates.length) return res.status(400).json({ message: 'Цей місяць поза періодом бронювання.' });

    try {
      // Widen the UTC range to include bookings near local midnight in any timezone.
      const monthStart = new Date(Date.UTC(year, monthNumber - 1, -1));
      const monthEnd = new Date(Date.UTC(year, monthNumber, 2));
      const booked = await BookingModel.find({ startAt: { $gte: monthStart, $lt: monthEnd } }).select('startAt').lean();
      const bookedStarts = new Set(booked.map((booking) => new Date(booking.startAt).toISOString()));
      const busyPeriods = await getCalendarBusyPeriods(monthStart, monthEnd, timezone);
      const days = [];
      for (const item of dayDates) {
        const isBookable = item >= todayDate && item <= lastBookableDate;
        days.push({
          date: item,
          isBookable,
          slots: isBookable ? await getSlotsForDate(item, bookedStarts, busyPeriods) : [],
        });
      }
      return res.json({ month, timezone, durationMinutes, bookingWindowDays, days });
    } catch (error) {
      console.error('Monthly availability lookup failed', error);
      return res.status(500).json({ message: 'Не вдалося завантажити вільний час.' });
    }
  }

  if (!isValidDateString(date)) return res.status(400).json({ message: 'Оберіть коректну дату.' });

  const startOfToday = new Date();
  const todayParts = getZonedParts(startOfToday);
  const today = `${todayParts.year}-${String(todayParts.month).padStart(2, '0')}-${String(todayParts.day).padStart(2, '0')}`;
  const earliest = Date.parse(`${today}T00:00:00Z`);
  const latest = earliest + bookingWindowDays * 24 * 60 * 60 * 1000;
  const requested = Date.parse(`${date}T00:00:00Z`);
  if (requested < earliest || requested > latest) return res.status(400).json({ message: 'Ця дата поза періодом бронювання.' });

  try {
    const slots = await getSlotsForDate(date);
    res.json({ date, timezone, durationMinutes, slots });
  } catch (error) {
    console.error('Availability lookup failed', error);
    res.status(500).json({ message: 'Не вдалося завантажити вільний час.' });
  }
};

export const create = async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const note = typeof req.body.note === 'string' ? req.body.note.trim() : '';
  const startAtValue = req.body.startAt;
  if (name.length < 2 || name.length > 100 || !/^\S+@\S+\.\S+$/.test(email) || email.length > 254 || note.length > 1000) {
    return res.status(400).json({ message: 'Перевірте ім’я, email і довжину повідомлення.' });
  }
  const startAt = new Date(startAtValue);
  if (Number.isNaN(startAt.getTime()) || startAt.toISOString() !== startAtValue) {
    return res.status(400).json({ message: 'Оберіть коректний час.' });
  }
  const parts = getZonedParts(startAt);
  const date = `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;

  try {
    const slots = await getSlotsForDate(date);
    const slot = slots.find(({ startAt: availableStart }) => availableStart === startAt.toISOString());
    if (!slot) return res.status(409).json({ message: 'Цей час щойно став недоступним. Оберіть інший.' });

    const booking = await BookingModel.create({
      name,
      email,
      note,
      startAt,
      endAt: new Date(slot.endAt),
      timezone,
    });
    let calendarEventId = null;
    try {
      if (isGoogleCalendarConfigured()) {
        calendarEventId = await createCalendarBooking({ startAt, endAt: new Date(slot.endAt), timezone });
        booking.googleCalendarEventId = calendarEventId;
        await booking.save();
      }
    } catch (calendarError) {
      if (calendarEventId) {
        try {
          await deleteCalendarBooking(calendarEventId);
        } catch (cleanupError) {
          console.error('Calendar event cleanup failed after booking error', cleanupError);
        }
      }
      try {
        await BookingModel.deleteOne({ _id: booking._id });
      } catch (cleanupError) {
        console.error('Booking cleanup failed after Calendar sync error', cleanupError);
      }
      console.error('Google Calendar booking sync failed', calendarError);
      return res.status(503).json({ message: 'Не вдалося синхронізувати бронювання з календарем. Спробуйте ще раз.' });
    }
    let notificationSent = false;
    if (isEmailConfigured()) {
      try {
        await sendBookingNotifications({ name, email, note, startAt, timezone });
        notificationSent = true;
      } catch (notificationError) {
        console.error('Booking email delivery failed', notificationError);
      }
    }
    res.status(201).json({
      id: booking._id,
      startAt: booking.startAt,
      endAt: booking.endAt,
      timezone,
      notificationSent,
    });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: 'Цей час щойно забронювали. Оберіть інший.' });
    console.error('Booking creation failed', error);
    res.status(500).json({ message: 'Не вдалося створити бронювання.' });
  }
};

export const getAll = async (_req, res) => {
  try {
    const bookings = await BookingModel.find().sort({ startAt: 1 }).lean();
    res.json(bookings);
  } catch (error) {
    console.error('Booking list failed', error);
    res.status(500).json({ message: 'Не вдалося завантажити бронювання.' });
  }
};

export const remove = async (req, res) => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Бронювання не знайдено.' });
    if (booking.googleCalendarEventId) {
      await deleteCalendarBooking(booking.googleCalendarEventId);
    }
    await BookingModel.deleteOne({ _id: booking._id });
    res.json({ message: 'Бронювання скасовано.' });
  } catch (error) {
    console.error('Booking cancellation failed', error);
    res.status(502).json({ message: 'Не вдалося скасувати бронювання в календарі. Спробуйте ще раз.' });
  }
};
