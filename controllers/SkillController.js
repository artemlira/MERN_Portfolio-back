import SkillModel from '../models/Skill.js';

export const getAll = async (req, res) => {
  try {
    const skills = await SkillModel.find().populate('user', 'fullName avatarUrl').exec();
    res.json(skills);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Не удалось получить Skills',
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const skillId = req.params.id;
    const skill = await SkillModel.findById({
      _id: skillId,
    });

    if (!skill) {
      return res.status(404).json({
        message: 'Skill не знайдено',
      });
    }

    res.json(skill);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Не удалось получить ONE Skill',
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new SkillModel({
      categoryEN: req.body.categoryEN,
      categoryUA: req.body.categoryUA,
      value: req.body.value,
      user: req.userId,
    });

    const skill = await doc.save();
    res.json(skill);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Не удалось добавить Skill',
    });
  }
};

export const remove = async (req, res) => {
  try {
    const skillId = req.params.id;

    const skill = await SkillModel.findOneAndDelete({
      _id: skillId,
    });

    if (!skill) {
      return res.status(404).json({
        message: 'Skill не знайдено',
      });
    }

    res.json({
      message: 'skill успешно удален',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Не удалось удалить Skill',
    });
  }
};

export const update = async (req, res) => {
  try {
    const skillId = req.params.id;
    const result = await SkillModel.updateOne(
      {
        _id: skillId,
      },
      {
        categoryEN: req.body.categoryEN,
        categoryUA: req.body.categoryUA,
        value: req.body.value,
        user: req.userId,
      },
    );

    if (!result.matchedCount) {
      return res.status(404).json({
        message: 'Skill не знайдено',
      });
    }

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Не удалось обновить Skill',
    });
  }
};
