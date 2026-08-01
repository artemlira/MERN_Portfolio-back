import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    skills: {
      type: Array,
      required: true,
    },
    img: String,
    imgWebp: String,
    shortDescriptionUA: {
      type: String,
      default: '',
    },
    shortDescriptionEN: {
      type: String,
      default: '',
    },
    fullDescriptionUA: {
      type: String,
      default: '',
    },
    fullDescriptionEN: {
      type: String,
      default: '',
    },
    git: {
      type: String,
      default: '',
    },
    deploy: {
      type: String,
      default: '',
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

export default mongoose.model('Project', ProjectSchema);
