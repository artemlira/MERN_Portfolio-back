import FileModel from '../models/File.js';

export const getAll = async (req, res) => {
  try {
    const files = await FileModel.find().populate('user', 'fullName avatarUrl').exec();
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Не удалось получить файлы',
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await FileModel.findById({
      _id: fileId,
    });

    if (!file) {
      return res.status(404).json({
        message: 'Файл не знайдено',
      });
    }

    res.json(file);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Не удалось получить ONE файл',
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new FileModel({
      name: req.body.name,
      img: req.body.img,
      user: req.userId,
    });

    const file = await doc.save();
    res.json(file);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Не удалось добавить файл',
    });
  }
};

export const remove = async (req, res) => {
  try {
    const fileId = req.params.id;

    const file = await FileModel.findOneAndDelete({
      _id: fileId,
    });

    if (!file) {
      return res.status(404).json({
        message: 'Файл не знайдено',
      });
    }

    res.json({
      message: 'Файл успешно удален',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Не удалось удалить файл',
    });
  }
};

export const update = async (req, res) => {
  try {
    const fileId = req.params.id;
    const result = await FileModel.updateOne(
      {
        _id: fileId,
      },
      {
        name: req.body.name,
        img: req.body.img,
        user: req.userId,
      },
    );

    if (!result.matchedCount) {
      return res.status(404).json({
        message: 'Файл не знайдено',
      });
    }

    res.json({
      message: 'Файл успешно обнавлен',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Не удалось обновить файл',
    });
  }
};
