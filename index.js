import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import {
  registerValidation,
  loginValidation,
  skillCreateValidation,
  mediaCreateValidation,
  contactCreateValidation,
  contactSubmissionValidation,
  factCreateValidation,
  projectCreateValidation,
  smallProjectCreateValidation,
  mongoIdValidation,
} from './validations.js';
import {
  UserController,
  SkillController,
  MediaController,
  ContactController,
  BookingController,
  FactController,
  ProjectController,
  SmallProjectController,
} from './controllers/index.js';
import { handleValidationErrors, checkAuth } from './utils/index.js';
import { CLIENT_ORIGINS, MONGO_URI, PORT } from './config.js';

const app = express();
let dbConnectionPromise = null;

const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!dbConnectionPromise) {
    dbConnectionPromise = mongoose
      .connect(MONGO_URI)
      .then(() => console.log('MongoDB OK'))
      .catch((err) => {
        dbConnectionPromise = null;
        throw err;
      });
  }

  await dbConnectionPromise;
};

const corsOptions = {
  origin(origin, callback) {
    if (!origin || CLIENT_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Забагато спроб авторизації. Спробуйте пізніше.' },
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method),
  message: { message: 'Забагато запитів. Спробуйте пізніше.' },
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Забагато повідомлень. Спробуйте пізніше.' },
});

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(cors(corsOptions));
app.use(writeLimiter);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use('/uploads', express.static('uploads'));
app.set('view engine', 'ejs');

connectToDatabase().catch((err) => console.error('MongoDB error', err));

app.use(async (req, res, next) => {
  if (req.path === '/health' || req.path === '/contact') return next();
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('MongoDB error', err);
    res.status(500).json({ message: 'Не вдалося підключитися до бази даних' });
  }
});

app.get('/health', (_, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.get('/bookings/config', BookingController.getConfig);
app.get('/bookings/availability', BookingController.getAvailability);
app.post('/bookings', BookingController.create);
app.get('/bookings', checkAuth, BookingController.getAll);
app.delete('/bookings/:id', checkAuth, mongoIdValidation, handleValidationErrors, BookingController.remove);

app.post('/auth/login', authLimiter, loginValidation, handleValidationErrors, UserController.login);
app.post(
  '/auth/register',
  authLimiter,
  registerValidation,
  handleValidationErrors,
  UserController.register,
);
app.get('/auth/me', checkAuth, UserController.getMe);

app.get('/skills', SkillController.getAll);
app.post(
  '/skills',
  checkAuth,
  skillCreateValidation,
  handleValidationErrors,
  SkillController.create,
);
app.delete('/skills/:id', checkAuth, mongoIdValidation, handleValidationErrors, SkillController.remove);
app.get('/skills/:id', checkAuth, mongoIdValidation, handleValidationErrors, SkillController.getOne);
app.patch(
  '/skills/:id',
  checkAuth,
  mongoIdValidation,
  skillCreateValidation,
  handleValidationErrors,
  SkillController.update,
);

app.get('/medias', MediaController.getAll);
app.post(
  '/medias',
  checkAuth,
  mediaCreateValidation,
  handleValidationErrors,
  MediaController.create,
);
app.delete('/medias/:id', checkAuth, mongoIdValidation, handleValidationErrors, MediaController.remove);
app.get('/medias/:id', checkAuth, mongoIdValidation, handleValidationErrors, MediaController.getOne);
app.patch(
  '/medias/:id',
  checkAuth,
  mongoIdValidation,
  mediaCreateValidation,
  handleValidationErrors,
  MediaController.update,
);

app.get('/contacts', ContactController.getAll);
app.post('/contact', contactLimiter, contactSubmissionValidation, handleValidationErrors, ContactController.submit);
app.post(
  '/contacts',
  checkAuth,
  contactCreateValidation,
  handleValidationErrors,
  ContactController.create,
);
app.delete(
  '/contacts/:id',
  checkAuth,
  mongoIdValidation,
  handleValidationErrors,
  ContactController.remove,
);
app.get(
  '/contacts/:id',
  checkAuth,
  mongoIdValidation,
  handleValidationErrors,
  ContactController.getOne,
);
app.patch(
  '/contacts/:id',
  checkAuth,
  mongoIdValidation,
  contactCreateValidation,
  handleValidationErrors,
  ContactController.update,
);

app.get('/facts', FactController.getAll);
app.post('/facts', checkAuth, factCreateValidation, handleValidationErrors, FactController.create);
app.delete('/facts/:id', checkAuth, mongoIdValidation, handleValidationErrors, FactController.remove);
app.get('/facts/:id', checkAuth, mongoIdValidation, handleValidationErrors, FactController.getOne);
app.patch(
  '/facts/:id',
  checkAuth,
  mongoIdValidation,
  factCreateValidation,
  handleValidationErrors,
  FactController.update,
);

app.get('/projects', ProjectController.getAll);
app.post(
  '/projects',
  checkAuth,
  projectCreateValidation,
  handleValidationErrors,
  ProjectController.create,
);
app.delete(
  '/projects/:id',
  checkAuth,
  mongoIdValidation,
  handleValidationErrors,
  ProjectController.remove,
);
app.get(
  '/projects/:id',
  checkAuth,
  mongoIdValidation,
  handleValidationErrors,
  ProjectController.getOne,
);
app.patch(
  '/projects/:id',
  checkAuth,
  mongoIdValidation,
  projectCreateValidation,
  handleValidationErrors,
  ProjectController.update,
);

app.get('/small', SmallProjectController.getAll);
app.post(
  '/small',
  checkAuth,
  smallProjectCreateValidation,
  handleValidationErrors,
  SmallProjectController.create,
);
app.delete(
  '/small/:id',
  checkAuth,
  mongoIdValidation,
  handleValidationErrors,
  SmallProjectController.remove,
);
app.get(
  '/small/:id',
  checkAuth,
  mongoIdValidation,
  handleValidationErrors,
  SmallProjectController.getOne,
);
app.patch(
  '/small/:id',
  checkAuth,
  mongoIdValidation,
  smallProjectCreateValidation,
  handleValidationErrors,
  SmallProjectController.update,
);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, (err) => {
    if (err) {
      return console.error(err);
    }
    console.log(`Server OK on port ${PORT}`);
  });
}

export default app;
