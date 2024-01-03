import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema(
  {
    name: String,
    img: {
      data: Buffer,
      contentType: String,
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

export default mongoose.model('File', FileSchema);
