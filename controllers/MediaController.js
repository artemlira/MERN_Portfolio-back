import MediaModel from '../models/Media.js';

export const getAll = async (req, res) => {
  try {
    const medias = await MediaModel.find().populate('user').exec();
    res.json(medias);
  } catch (err) {
    console.log(err);
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
    res.json(media);
  } catch (err) {
    console.log(err);
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
    console.log(err);
    res.status(500).json({
      message: 'Не удалось добавить соц. сеть'
    });
  }
};

export const remove = async (req, res) => {
  try {
    const mediaId = req.params.id;

    await MediaModel.findOneAndDelete({
      _id: mediaId
    });
    res.json({
      message: 'Соц. сеть успешно удалена',
    })
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось удалить Соц. сеть'
    });
  }
};

export const update = async (req, res) => {
  try {
    const mediaId = req.params.id;
    await MediaModel.updateOne({
      _id: mediaId
    },
      {
        name: req.body.name,
        link: req.body.link,
        icon: req.body.icon,
        user: req.userId
      });
    res.json({
      message: 'Соц. сеть успешно обнавлена',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить Соц. сеть'
    });
  }
};