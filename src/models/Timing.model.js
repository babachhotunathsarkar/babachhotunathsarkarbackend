import mongoose from 'mongoose';

const timingSchema = new mongoose.Schema({
  title:    { type: String, required: true }, // e.g. "Summer Timings", "Morning Opening"
  startTime: { type: String, required: true }, // e.g. "05:00 AM"
  endTime:  { type: String, required: true }, // e.g. "09:00 PM"
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Timing', timingSchema);
