import mongoose from 'mongoose';

const specialDaySchema = new mongoose.Schema({
  title:      { type: String, required: true }, // e.g. "Rama Navami", "Every Purnima"
  date:       { type: String, required: true }, // "April 15th", "Monthly"
  description: { type: String, trim: true },
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('SpecialDay', specialDaySchema);
