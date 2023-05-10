import mongoose from 'mongoose';

const SkillSchema = new mongoose.Schema(
  {
    categoryEN: {
      type: String,
      required: true,
    },
    categoryUA: {
      type: String,
      required: true,
    },
    value: {
      type: Array,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Skill', SkillSchema);
