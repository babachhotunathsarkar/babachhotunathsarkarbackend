import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['event', 'news', 'notice'],
    required: true,
    lowercase: true
  },
  image: {
    type: String,        // Cloudinary ya local image URL
    default: null
  }
}, { 
  timestamps: true 
});

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;