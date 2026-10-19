import ContactModel from '../models/Contact.js';
import { isEmailConfigured, sendContactMessage } from '../utils/email.js';

export const submit = async (req, res) => {
  if (typeof req.body.website === 'string' && req.body.website.trim()) {
    return res.status(202).json({ message: 'Повідомлення надіслано.' });
  }

  if (!isEmailConfigured()) {
    return res.status(503).json({ message: 'Форма тимчасово недоступна. Спробуйте пізніше.' });
  }

  try {
    await sendContactMessage({
      name: req.body.name.trim(),
      email: req.body.email.trim(),
      title: req.body.title.trim(),
      message: req.body.message.trim(),
      locale: req.body.locale,
    });
    return res.status(202).json({ message: 'Повідомлення надіслано.' });
  } catch (error) {
    console.error('Contact email delivery failed', error);
    return res.status(502).json({ message: 'Не вдалося надіслати повідомлення. Спробуйте пізніше.' });
  }
};

export const getAll = async (req, res) => {
  try {
    const contacts = await ContactModel.find().populate('user', 'fullName avatarUrl').exec();
    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Не удалось получить контакты',
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const contactId = req.params.id;
    const contact = await ContactModel.findById({
      _id: contactId,
    });

    if (!contact) {
      return res.status(404).json({
        message: 'Контакт не знайдено',
      });
    }

    res.json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Не удалось получить ONE контакт',
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new ContactModel({
      name: req.body.name,
      value: req.body.value,
      icon: req.body.icon,
      user: req.userId,
    });

    const contact = await doc.save();
    res.json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Не удалось добавить контакт',
    });
  }
};

export const remove = async (req, res) => {
  try {
    const contactId = req.params.id;

    const contact = await ContactModel.findOneAndDelete({
      _id: contactId,
    });

    if (!contact) {
      return res.status(404).json({
        message: 'Контакт не знайдено',
      });
    }

    res.json({
      message: 'Контакт успешно удален',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Не удалось удалить контакт',
    });
  }
};

export const update = async (req, res) => {
  try {
    const contactId = req.params.id;
    const result = await ContactModel.updateOne(
      {
        _id: contactId,
      },
      {
        name: req.body.name,
        value: req.body.value,
        icon: req.body.icon,
        user: req.userId,
      },
    );

    if (!result.matchedCount) {
      return res.status(404).json({
        message: 'Контакт не знайдено',
      });
    }

    res.json({
      message: 'Контакт успешно обнавлен',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Не удалось обновить контакты',
    });
  }
};
