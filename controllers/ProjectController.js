import ProjectModel from '../models/Project.js';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

export const getAll = async (req, res) => {
  try {
    const projects = await ProjectModel.find().populate('user').exec();
    res.json(projects);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить проекты',
    });
  }
};

export const create = async (req, res) => {
  try {
    if (req.files) {
      let fileName = req.files.image.name;
      const __dirname = dirname(fileURLToPath(import.meta.url));
      req.files.image.mv(path.join(__dirname, '..', 'uploads', fileName));

      const newProjectWithImage = new ProjectModel({
        title: req.body.title,
        skills: req.body.skills,
        img: fileName,
        // imgWebp: fileName,
        shortDescriptionUA: req.body.shortDescriptionUA,
        shortDescriptionEN: req.body.shortDescriptionEN,
        fullDescriptionUA: req.body.fullDescriptionUA,
        fullDescriptionEN: req.body.fullDescriptionEN,
        git: req.body.git,
        deploy: req.body.deploy,
        user: req.userId,
      });

      await newProjectWithImage.save();
      return res.json(newProjectWithImage);
    }

    const newProjectWithoutImage = new ProjectModel({
      title: req.body.title,
      skills: req.body.skills,
      img: '',
      // imgWebp: '',
      shortDescriptionUA: req.body.shortDescriptionUA,
      shortDescriptionEN: req.body.shortDescriptionEN,
      fullDescriptionUA: req.body.fullDescriptionUA,
      fullDescriptionEN: req.body.fullDescriptionEN,
      git: req.body.git,
      deploy: req.body.deploy,
      user: req.userId,
    });
    await newProjectWithoutImage.save();
    res.json(newProjectWithoutImage);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось добавить проект',
    });
  }
};

// export const create = async (req, res) => {
//   try {
//     const doc = new ProjectModel({
//       title: req.body.title,
//       skills: req.body.skills,
//       img: req.body.img,
//       imgWebp: req.body.imgWebp,
//       shortDescriptionUA: req.body.shortDescriptionUA,
//       shortDescriptionEN: req.body.shortDescriptionEN,
//       fullDescriptionUA: req.body.fullDescriptionUA,
//       fullDescriptionEN: req.body.fullDescriptionEN,
//       git: req.body.git,
//       deploy: req.body.deploy,
//       user: req.userId,
//     });

//     const project = await doc.save();
//     res.json(project);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       message: 'Не удалось добавить проект',
//     });
//   }
// };

export const remove = async (req, res) => {
  try {
    const projectId = req.params.id;

    await ProjectModel.findOneAndDelete({
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

export const getOne = async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await ProjectModel.findById({
      _id: projectId,
    });
    res.json(project);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить full проект',
    });
  }
};

export const update = async (req, res) => {
  try {
    const projectId = req.params.id;
    await ProjectModel.updateOne(
      {
        _id: projectId,
      },
      {
        title: req.body.title,
        skills: req.body.skills,
        img: req.body.img,
        // imgWebp: req.body.imgWebp,
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
