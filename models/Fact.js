import mongoose from 'mongoose';

const FactSchema = new mongoose.Schema(
  {
    valueEN: {
      type: String,
      required: true,
    },
    valueUA: {
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

export default mongoose.model('Fact', FactSchema);
