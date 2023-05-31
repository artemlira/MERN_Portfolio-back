import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Grid from 'gridfs-stream';
import GridFsStorage from 'multer-gridfs-storage';
import bodyParser from 'body-parser';
import FileModel from './models/File.js';
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

//=====================
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
//=====================

// const PORT = process.env.PORT || 4444;

mongoose
  .connect(
    `mongodb+srv://admin:wwwwww@cluster0.jcpn6xu.mongodb.net/portfolio?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true },
  )
  .then(() => console.log('MongoDB OK'))
  .catch((err) => console.log('MongoDB error', err));

//===================================
const conn = mongoose.connection;
conn.on('connected', () => console.log('database is connected successfully'));
conn.on('disconnected', () => console.log('database is disconnected successfully'));
conn.on('error', console.error.bind(console, 'connection error:'));
//===================================

// const storage = multer.diskStorage({
//   destination: (_, __, cb) => {
//     if (!fs.existsSync('uploads')) {
//       fs.mkdirSync('uploads');
//     }
//     cb(null, './uploads');
//   },
//   filename: (_, file, cb) => {
//     cb(null, file.originalname);
//   },
// });

//====================================
// SET STORAGE
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  })

//====================================

const upload = multer({ storage: storage });

//===================================

app.post('/uploadphoto', upload.single('image'), (req, res) => {
  const img = fs.readFileSync(req.file.path);
  const encode_img = img.toString('base64');
  const final_img = {
    contentType: req.file.mimetype,
    image: new Buffer(encode_img, 'base64'),
  };
  FileModel.create(final_img, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result.img.Buffer);
      console.log('Saved To database');
      res.contentType(final_img.contentType);
      res.send(final_img.image);
    }
  });
});
//===================================


app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
//   try {
//     if (req.file) {
//       res.json({
//         url: `/uploads/${req.file.originalname}`,
//         message: 'Файл успішно завантажено!',
//         req: req,
//       });
//     } else {
//       res.json({
//         success: false,
//         message: 'Помилка завантаження файлу.',
//         req: req,
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       message: 'Не удалось загрузить картинку на сервере',
//     });
//   }
// });

//=====================================


//=====================================

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
