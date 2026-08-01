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
export const MONGO_URI = getMongoUri();
export const CLIENT_ORIGINS =
  getCsvValues(process.env.CLIENT_ORIGINS || process.env.CORS_ORIGIN) ||
  DEFAULT_CLIENT_ORIGINS;
export const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === 'production' ? null : 'dev-only-jwt-secret');
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

if (!MONGO_URI) {
  throw new Error('MONGO_URI or DB_USER, DB_PASSWORD and DB_NAME environment variables are required');
}

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
