import FileModel from '../models/File.js';

export const getAll = async (req, res) => {
  try {
    const facts = await FileModel.find().populate('user').exec();
    res.json(facts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить файлы',
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const factId = req.params.id;
    const fact = await FactModel.findById({
      _id: factId,
    });
    res.json(fact);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить ONE факт',
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new FactModel({
      valueUA: req.body.valueUA,
      valueEN: req.body.valueEN,
      user: req.userId,
    });

    const fact = await doc.save();
    res.json(fact);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось добавить факт',
    });
  }
};

export const remove = async (req, res) => {
  try {
    const factId = req.params.id;

    await FactModel.findOneAndDelete({
      _id: factId,
    });
    res.json({
      message: 'Факты успешно удалены',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось удалить факты',
    });
  }
};

export const update = async (req, res) => {
  try {
    const factId = req.params.id;
    await FactModel.updateOne(
      {
        _id: factId,
      },
      {
        valueUA: req.body.valueUA,
        valueEN: req.body.valueEN,
        user: req.userId,
      },
    );
    res.json({
      message: 'Факты успешно обнавлены',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить факты',
    });
  }
};
