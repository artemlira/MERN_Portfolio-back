import { body, param } from 'express-validator';

export const mongoIdValidation = [
  param('id', 'Невірний id').isMongoId(),
];

export const loginValidation = [
  body('email', 'Неверный формат почты').trim().isEmail().normalizeEmail(),
  body('password', 'Пароль должен быть не менее 5 символов').isLength({ min: 5 }),
];

export const registerValidation = [
  body('email', 'Неверный формат почты').trim().isEmail().normalizeEmail(),
  body('password', 'Пароль должен быть не менее 5 символов').isLength({ min: 5 }),
  body('fullName', 'Укажите имя').trim().isLength({ min: 3 }),
  body('avatarUrl', 'Неверная ссылка на аватарку')
    .optional({ checkFalsy: true })
    .isURL({ protocols: ['http', 'https'], require_protocol: true }),
];

export const skillCreateValidation = [
  body('categoryEN', 'Enter a category').trim().isLength({ min: 3 }).isString(),
  body('categoryUA', 'Введите категорию').trim().isLength({ min: 3 }).isString(),
  body('value', 'Укажите значения').isArray({ min: 1 }),
];

export const mediaCreateValidation = [
  body('name', 'Введите имя соц. сети').trim().isLength({ min: 3 }).isString(),
  body('link', 'Неверная ссылка на соц. сеть')
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true }),
  body('icon', 'Неверная ссылка на иконку').isString(),
];

export const contactCreateValidation = [
  body('name', 'Введите название контакта').trim().isLength({ min: 3 }).isString(),
  body('value', 'Неверное значене контакта').trim().isLength({ min: 3 }).isString(),
  body('icon', 'Неверная ссылка на контакт').isString(),
];

export const factCreateValidation = [
  body('valueUA', 'Введите массив фактов').trim().isString(),
  body('valueEN', 'Введите массив фактов').trim().isString(),
];

export const projectCreateValidation = [
  body('title', 'Введите название проекта').trim().isLength({ min: 3 }).isString(),
  body('skills', 'Введите массив используемых технологий').isArray(),
  body('skills.*', 'Навички мають бути рядками').trim().isString(),
  body('img', 'Неверная ссылка на изображение').optional({ checkFalsy: true }).isString(),
  body('imgWebp', 'Неверная ссылка на изображение webp').optional({ checkFalsy: true }).isString(),
  body('base64', 'Неверная ссылка на изображение').optional({ checkFalsy: true }).isString(),
  body('base64Webp', 'Неверная ссылка на изображение webp').optional({ checkFalsy: true }).isString(),
  body('shortDescriptionUA', 'Введите краткое описание проекта')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3 })
    .isString(),
  body('shortDescriptionEN', 'Введите краткое описание проекта')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3 })
    .isString(),
  body('fullDescriptionUA', 'Введите полное описание проекта')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10 })
    .isString(),
  body('fullDescriptionEN', 'Введите полное описание проекта')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10 })
    .isString(),
  body('git', 'Неверная ссылка на контакт')
    .optional({ checkFalsy: true })
    .isURL({ protocols: ['http', 'https'], require_protocol: true }),
  body('deploy', 'Неверная ссылка на контакт')
    .optional({ checkFalsy: true })
    .isURL({ protocols: ['http', 'https'], require_protocol: true }),
];

export const smallProjectCreateValidation = [
  body('title', 'Введите название проекта').trim().isLength({ min: 3 }).isString(),
  body('skills', 'Введите массив используемых технологий').isArray(),
  body('skills.*', 'Навички мають бути рядками').trim().isString(),
  body('img', 'Неверная ссылка на изображение').optional({ checkFalsy: true }).isString(),
  body('imgWebp', 'Неверная ссылка на изображение webp').optional({ checkFalsy: true }).isString(),
  body('base64', 'Неверная ссылка на изображение').optional({ checkFalsy: true }).isString(),
  body('base64Webp', 'Неверная ссылка на изображение webp').optional({ checkFalsy: true }).isString(),
  body('shortDescriptionUA', 'Введите краткое описание проекта')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3 })
    .isString(),
  body('shortDescriptionEN', 'Введите краткое описание проекта')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3 })
    .isString(),
  body('fullDescriptionUA', 'Введите полное описание проекта')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10 })
    .isString(),
  body('fullDescriptionEN', 'Введите полное описание проекта')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10 })
    .isString(),
  body('git', 'Неверная ссылка на контакт')
    .optional({ checkFalsy: true })
    .isURL({ protocols: ['http', 'https'], require_protocol: true }),
  body('deploy', 'Неверная ссылка на контакт')
    .optional({ checkFalsy: true })
    .isURL({ protocols: ['http', 'https'], require_protocol: true }),
];
