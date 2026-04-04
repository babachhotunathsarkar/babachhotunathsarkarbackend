// backend/src/models/video.modal.js
import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    title:      { type: String, required: true, trim: true },
    category:   { type: String, enum: ['general','temple','events','festivals','gallery','other'], default: 'general' },
    videoUrl:   { type: String, required: true },
    publicId:   { type: String, default: '' },
    thumbnail:  { type: String, default: '' },
    format:     { type: String, default: '' },
    size:       { type: Number, default: 0 },
    duration:   { type: Number, default: 0 },
    width:      { type: Number, default: 0 },
    height:     { type: Number, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

const Video = mongoose.model('Video', videoSchema);
export default Video;