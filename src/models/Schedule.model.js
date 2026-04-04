import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  time: { type: String, required: true }, // e.g. "05:00 AM"
  activity: { type: String, required: true }, // e.g. "Mangala Aarti"
  description: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Schedule', scheduleSchema);
