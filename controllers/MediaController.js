import MediaModel from '../models/Media.js';

export const getAll = async (req, res) => {
  try {
    const medias = await MediaModel.find().populate('user', 'fullName avatarUrl').exec();
    res.json(medias);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Не удалось получить соц. сети'
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const mediaId = req.params.id;
    const media = await MediaModel.findById({
      _id: mediaId,
    });

    if (!media) {
      return res.status(404).json({
        message: 'Соц. сеть не знайдена',
      });
    }

    res.json(media);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Не удалось получить ONE соц. сеть',
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new MediaModel({
      name: req.body.name,
      link: req.body.link,
      icon: req.body.icon,
      user: req.userId
    });

    const media = await doc.save();
    res.json(media)
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Не удалось добавить соц. сеть'
    });
  }
};

export const remove = async (req, res) => {
  try {
    const mediaId = req.params.id;

    const media = await MediaModel.findOneAndDelete({
      _id: mediaId
    });

    if (!media) {
      return res.status(404).json({
        message: 'Соц. сеть не знайдена',
      });
    }

    res.json({
      message: 'Соц. сеть успешно удалена',
    })
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Не удалось удалить Соц. сеть'
    });
  }
};

export const update = async (req, res) => {
  try {
    const mediaId = req.params.id;
    const result = await MediaModel.updateOne({
      _id: mediaId
    },
      {
        name: req.body.name,
        link: req.body.link,
        icon: req.body.icon,
        user: req.userId
      });

    if (!result.matchedCount) {
      return res.status(404).json({
        message: 'Соц. сеть не знайдена',
      });
    }

    res.json({
      message: 'Соц. сеть успешно обнавлена',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Не удалось обновить Соц. сеть'
    });
  }
};
