import SmallProjectModel from '../models/SmallProject.js';

export const getAll = async (req, res) => {
  try {
    const projects = await SmallProjectModel.find().populate('user').exec();
    res.json(projects);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить проекты',
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await SmallProjectModel.findById({
      _id: projectId,
    });
    res.json(project);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить small проект',
    });
  }
};

export const create = async (req, res) => {
  const { base64 } = req.body;
  const { base64Webp } = req.body;
  try {
    SmallProjectModel.create({
      title: req.body.title,
      skills: req.body.skills,
      img: base64,
      imgWebp: base64Webp,
      shortDescriptionUA: req.body.shortDescriptionUA,
      shortDescriptionEN: req.body.shortDescriptionEN,
      fullDescriptionUA: req.body.fullDescriptionUA,
      fullDescriptionEN: req.body.fullDescriptionEN,
      git: req.body.git,
      deploy: req.body.deploy,
      user: req.userId,
    });

    // const project = await doc.save();
    res.json(project);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось добавить проект',
    });
  }
};

export const remove = async (req, res) => {
  try {
    const projectId = req.params.id;

    await SmallProjectModel.findOneAndDelete({
      _id: projectId,
    });
    res.json({
      message: 'Проект успешно удален',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось удалить проект',
    });
  }
};

export const update = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { base64 } = req.body;
    const { base64Webp } = req.body;
    await SmallProjectModel.updateOne(
      {
        _id: projectId,
      },
      {
        title: req.body.title,
        skills: req.body.skills,
        img: base64,
        imgWebp: base64Webp,
        shortDescriptionUA: req.body.shortDescriptionUA,
        shortDescriptionEN: req.body.shortDescriptionEN,
        fullDescriptionUA: req.body.fullDescriptionUA,
        fullDescriptionEN: req.body.fullDescriptionEN,
        git: req.body.git,
        deploy: req.body.deploy,
        user: req.userId,
      },
    );
    res.json({
      message: 'Проект успешно обнавлен',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить проекты',
    });
  }
};
