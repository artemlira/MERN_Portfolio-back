import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    note: { type: String, trim: true, maxlength: 1000, default: '' },
    startAt: { type: Date, required: true, unique: true },
    endAt: { type: Date, required: true },
    timezone: { type: String, required: true },
    googleCalendarEventId: { type: String, default: null },
    meetUrl: { type: String, default: '' },
    confirmationTokenHash: { type: String, select: false },
    meetingResponse: { type: String, enum: ['pending', 'confirmed', 'declined'], default: 'pending' },
    meetingRespondedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model('Booking', BookingSchema);
