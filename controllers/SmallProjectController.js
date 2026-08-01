import SmallProjectModel from '../models/SmallProject.js';

const getProjectPayload = (req) => ({
  title: req.body.title,
  skills: req.body.skills,
  img: req.body.base64 ?? req.body.img ?? '',
  imgWebp: req.body.base64Webp ?? req.body.imgWebp ?? '',
  shortDescriptionUA: req.body.shortDescriptionUA,
  shortDescriptionEN: req.body.shortDescriptionEN,
  fullDescriptionUA: req.body.fullDescriptionUA,
  fullDescriptionEN: req.body.fullDescriptionEN,
  git: req.body.git ?? '',
  deploy: req.body.deploy ?? '',
  user: req.userId,
});

export const getAll = async (req, res) => {
  try {
    const projects = await SmallProjectModel.find().populate('user', 'fullName avatarUrl').exec();
    res.json(projects);
  } catch (err) {
    console.error(err);
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

    if (!project) {
      return res.status(404).json({
        message: 'Проект не знайдено',
      });
    }

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Не удалось получить small проект',
    });
  }
};

export const create = async (req, res) => {
  try {
    const project = await SmallProjectModel.create(getProjectPayload(req));

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Не удалось добавить проект',
    });
  }
};

export const remove = async (req, res) => {
  try {
    const projectId = req.params.id;

    const project = await SmallProjectModel.findOneAndDelete({
      _id: projectId,
    });

    if (!project) {
      return res.status(404).json({
        message: 'Проект не знайдено',
      });
    }

    res.json({
      message: 'Проект успешно удален',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Не удалось удалить проект',
    });
  }
};

export const update = async (req, res) => {
  try {
    const projectId = req.params.id;
    const result = await SmallProjectModel.updateOne(
      {
        _id: projectId,
      },
      getProjectPayload(req),
    );

    if (!result.matchedCount) {
      return res.status(404).json({
        message: 'Проект не знайдено',
      });
    }

    res.json({
      message: 'Проект успешно обнавлен',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Не удалось обновить проекты',
    });
  }
};
