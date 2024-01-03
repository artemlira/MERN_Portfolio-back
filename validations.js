import { body } from 'express-validator';

export const loginValidation = [
  body('email', 'Неверный формат почты').isEmail(),
  body('password', 'Пароль должен быть не менее 5 символов').isLength({ min: 5 }),
];

export const registerValidation = [
  body('email', 'Неверный формат почты').isEmail(),
  body('password', 'Пароль должен быть не менее 5 символов').isLength({ min: 5 }),
  body('fullName', 'Укажите имя').isLength({ min: 3 }),
  body('avatarUrl', 'Неверная ссылка на аватарку').optional().isURL(),
];

export const skillCreateValidation = [
  body('categoryEN', 'Enter a category').isLength({ min: 3 }).isString(),
  body('categoryUA', 'Введите категорию').isLength({ min: 3 }).isString(),
  body('value', 'Укажите значения').isArray(),
];

export const mediaCreateValidation = [
  body('name', 'Введите имя соц. сети').isLength({ min: 3 }).isString(),
  body('link', 'Неверная ссылка на соц. сеть').isURL(),
  body('icon', 'Неверная ссылка на иконку').isString(),
];

export const contactCreateValidation = [
  body('name', 'Введите название контакта').isLength({ min: 3 }).isString(),
  body('value', 'Неверное значене контакта').isLength({ min: 3 }).isString(),
  body('icon', 'Неверная ссылка на контакт').isString(),
];

export const factCreateValidation = [
  body('valueUA', 'Введите массив фактов').isString(),
  body('valueEN', 'Введите массив фактов').isString(),
];

export const projectCreateValidation = [
  body('title', 'Введите название проекта').isLength({ min: 3 }).isString(),
  body('skills', 'Введите массив используемых технологий').isArray(),
  body('img', 'Неверная ссылка на изображение').optional().isString(),
  body('imgWebp', 'Неверная ссылка на изображение webp').optional().isString(),
  body('shortDescriptionUA', 'Введите краткое описание проекта').isLength({ min: 3 }).isString(),
  body('shortDescriptionEN', 'Введите краткое описание проекта').isLength({ min: 3 }).isString(),
  body('fullDescriptionUA', 'Введите полное описание проекта').isLength({ min: 10 }).isString(),
  body('fullDescriptionEN', 'Введите полное описание проекта').isLength({ min: 10 }).isString(),
  body('git', 'Неверная ссылка на контакт').isURL(),
  body('deploy', 'Неверная ссылка на контакт').isURL(),
];

export const smallProjectCreateValidation = [
  body('title', 'Введите название проекта').isLength({ min: 3 }).isString(),
  body('skills', 'Введите массив используемых технологий').isArray(),
  body('img', 'Неверная ссылка на изображение').optional().isString(),
  body('imgWebp', 'Неверная ссылка на изображение webp').optional().isString(),
  body('shortDescriptionUA', 'Введите краткое описание проекта').isLength({ min: 3 }).isString(),
  body('shortDescriptionEN', 'Введите краткое описание проекта').isLength({ min: 3 }).isString(),
  body('fullDescriptionUA', 'Введите полное описание проекта').isLength({ min: 10 }).isString(),
  body('fullDescriptionEN', 'Введите полное описание проекта').isLength({ min: 10 }).isString(),
  body('git', 'Неверная ссылка на контакт').isURL(),
  body('deploy', 'Неверная ссылка на контакт').isURL(),
];
