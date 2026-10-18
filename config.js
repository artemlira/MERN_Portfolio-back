import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_CLIENT_ORIGINS = [
  'https://artem-lira.netlify.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
];

const getCsvValues = (value) =>
  value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const DEFAULT_BOOKING_WEEKLY_HOURS = {
  1: ['10:00', '16:00'],
  2: ['10:00', '16:00'],
  3: ['10:00', '16:00'],
  4: ['10:00', '16:00'],
  5: ['10:00', '16:00'],
};

const getBookingTimezone = () => {
  const timezone = process.env.BOOKING_TIMEZONE || 'Europe/Kyiv';
  try {
    new Intl.DateTimeFormat('en', { timeZone: timezone });
    return timezone;
  } catch {
    return 'Europe/Kyiv';
  }
};

const getIntegerSetting = (value, fallback, minimum, maximum) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : fallback;
};

const getBookingWeeklyHours = () => {
  try {
    const hours = JSON.parse(process.env.BOOKING_WEEKLY_HOURS || JSON.stringify(DEFAULT_BOOKING_WEEKLY_HOURS));
    return hours && typeof hours === 'object' && !Array.isArray(hours) ? hours : DEFAULT_BOOKING_WEEKLY_HOURS;
  } catch {
    return DEFAULT_BOOKING_WEEKLY_HOURS;
  }
};

const getMongoUri = () => {
  if (process.env.MONGO_URI) {
    return process.env.MONGO_URI;
  }

  const { DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  if (!DB_USER || !DB_PASSWORD || !DB_NAME) {
    return null;
  }

  return `mongodb+srv://${encodeURIComponent(DB_USER)}:${encodeURIComponent(
    DB_PASSWORD,
  )}@cluster0.jcpn6xu.mongodb.net/${encodeURIComponent(DB_NAME)}?retryWrites=true&w=majority`;
};

export const PORT = process.env.PORT || 4444;
export const BOOKING_TIMEZONE = getBookingTimezone();
export const BOOKING_DURATION_MINUTES = getIntegerSetting(process.env.BOOKING_DURATION_MINUTES, 30, 10, 240);
const parsedBookingNotice = Number(process.env.BOOKING_MINIMUM_NOTICE_HOURS);
export const BOOKING_MINIMUM_NOTICE_HOURS = Number.isFinite(parsedBookingNotice) && parsedBookingNotice >= 0
  ? parsedBookingNotice
  : 24;
export const BOOKING_WINDOW_DAYS = getIntegerSetting(process.env.BOOKING_WINDOW_DAYS, 14, 1, 90);
export const BOOKING_WEEKLY_HOURS = getBookingWeeklyHours();
export const MONGO_URI = getMongoUri();
export const CLIENT_ORIGINS =
  getCsvValues(process.env.CLIENT_ORIGINS || process.env.CORS_ORIGIN) ||
  DEFAULT_CLIENT_ORIGINS;
export const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === 'production' ? null : 'dev-only-jwt-secret');
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';
export const SMTP_HOST = process.env.SMTP_HOST || '';
export const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
export const SMTP_SECURE = process.env.SMTP_SECURE !== 'false';
export const SMTP_USER = process.env.SMTP_USER || '';
export const SMTP_PASS = process.env.SMTP_PASS || '';
export const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;
export const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || '';

if (!MONGO_URI) {
  throw new Error('MONGO_URI or DB_USER, DB_PASSWORD and DB_NAME environment variables are required');
}

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
