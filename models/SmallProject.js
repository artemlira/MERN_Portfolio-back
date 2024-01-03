import mongoose from 'mongoose';

const SmallProjectSchema = new mongoose.Schema(
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
      required: true,
    },
    shortDescriptionEN: {
      type: String,
      required: true,
    },
    fullDescriptionUA: {
      type: String,
      required: true,
    },
    fullDescriptionEN: {
      type: String,
      required: true,
    },
    git: {
      type: String,
      required: true,
    },
    deploy: {
      type: String,
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

export default mongoose.model('SmallProject', SmallProjectSchema);
