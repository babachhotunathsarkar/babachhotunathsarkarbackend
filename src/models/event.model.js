import mongoose from 'mongoose';
 
const eventSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  eventDate:   { type: Date, required: true },
  eventTime:   { type: String, trim: true },         // e.g. "10:00 AM"
  location:    { type: String, trim: true },
  category:    {
    type: String,
    enum: ['general', 'festival', 'puja', 'seva', 'cultural', 'other'],
    default: 'general',
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
 
export default mongoose.model('Event', eventSchema);