import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {
  registerValidation,
  loginValidation,
  skillCreateValidation,
  mediaCreateValidation,
  contactCreateValidation,
  factCreateValidation,
  projectCreateValidation,
  smallProjectCreateValidation,
} from './validations.js';
import {
  UserController,
  SkillController,
  MediaController,
  ContactController,
  FactController,
  ProjectController,
  SmallProjectController,
} from './controllers/index.js';
import { handleValidationErrors, checkAuth } from './utils/index.js';

const app = express();
dotenv.config();

// const PORT = process.env.PORT || 4444;

mongoose
  .connect(
    `mongodb+srv://admin:wwwwww@cluster0.jcpn6xu.mongodb.net/portfolio?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true },
  )
  .then(() => console.log('MongoDB OK'))
  .catch((err) => console.log('MongoDB error', err));

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, './uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  try {
    if (req.file) {
      res.json({
        url: `/uploads/${req.file.originalname}`,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось загрузить картинку на сервере',
    });
  }
});

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.get('/skills', SkillController.getAll);
app.post(
  '/skills',
  checkAuth,
  skillCreateValidation,
  handleValidationErrors,
  SkillController.create,
);
app.delete('/skills/:id', checkAuth, SkillController.remove);
app.get('/skills/:id', checkAuth, SkillController.getOne);
app.patch(
  '/skills/:id',
  checkAuth,
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
app.delete('/medias/:id', checkAuth, MediaController.remove);
app.get('/medias/:id', checkAuth, MediaController.getOne);
app.patch(
  '/medias/:id',
  checkAuth,
  mediaCreateValidation,
  handleValidationErrors,
  MediaController.update,
);

app.get('/contacts', ContactController.getAll);
app.post(
  '/contacts',
  checkAuth,
  contactCreateValidation,
  handleValidationErrors,
  ContactController.create,
);
app.delete('/contacts/:id', checkAuth, ContactController.remove);
app.get('/contacts/:id', checkAuth, ContactController.getOne);
app.patch(
  '/contacts/:id',
  checkAuth,
  contactCreateValidation,
  handleValidationErrors,
  ContactController.update,
);

app.get('/facts', FactController.getAll);
app.post('/facts', checkAuth, factCreateValidation, handleValidationErrors, FactController.create);
app.delete('/facts/:id', checkAuth, FactController.remove);
app.get('/facts/:id', checkAuth, FactController.getOne);
app.patch(
  '/facts/:id',
  checkAuth,
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
app.delete('/projects/:id', checkAuth, ProjectController.remove);
app.get('/projects/:id', checkAuth, ProjectController.getOne);
app.patch(
  '/projects/:id',
  checkAuth,
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
app.delete('/small/:id', checkAuth, SmallProjectController.remove);
app.get('/small/:id', checkAuth, SmallProjectController.getOne);
app.patch(
  '/small/:id',
  checkAuth,
  smallProjectCreateValidation,
  handleValidationErrors,
  SmallProjectController.update,
);

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log(`Server OK`);
});
