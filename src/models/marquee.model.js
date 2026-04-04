import mongoose from 'mongoose';
 
const marqueeSchema = new mongoose.Schema({
  text:     { type: String, required: true, trim: true },
  order:    { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
 
export default mongoose.model('Marquee', marqueeSchema);