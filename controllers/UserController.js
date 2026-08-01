import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel from "../models/User.js";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config.js";

const signToken = (userId) =>
  jwt.sign(
    {
      _id: userId,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    },
  );

export const register = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash,
    });

    const user = await doc.save();

    const token = signToken(user._id);

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token
    });
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(409).json({
        message: 'Користувач з таким email вже існує',
      });
    }

    res.status(500).json({
      message: 'Не удалось зарегистрироваться'
    });
  }
};

export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        message: 'Невірний email або пароль'
      });
    }

    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);
    if (!isValidPass) {
      return res.status(401).json({
        message: 'Невірний email або пароль'
      });
    }

    const token = signToken(user._id);

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Не удалось авторизоваться'
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден"
      });
    }

    const { passwordHash, ...userData } = user._doc;

    res.json(userData);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Нет доступа'
    });
  }
}
