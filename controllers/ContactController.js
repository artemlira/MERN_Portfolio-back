import ContactModel from '../models/Contact.js';

export const getAll = async (req, res) => {
  try {
    const contacts = await ContactModel.find().populate('user').exec();
    res.json(contacts);
  } catch (err) {
    console.log(err);
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
    res.json(contact);
  } catch (err) {
    console.log(err);
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
    console.log(err);
    res.status(500).json({
      message: 'Не удалось добавить контакт',
    });
  }
};

export const remove = async (req, res) => {
  try {
    const contactId = req.params.id;

    await ContactModel.findOneAndDelete({
      _id: contactId,
    });
    res.json({
      message: 'Контакт успешно удален',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось удалить контакт',
    });
  }
};

export const update = async (req, res) => {
  try {
    const contactId = req.params.id;
    await ContactModel.updateOne(
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
    res.json({
      message: 'Контакт успешно обнавлен',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить контакты',
    });
  }
};
