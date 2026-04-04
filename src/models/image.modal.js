import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    default: 'Events'
  },
  imageUrl: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Image = mongoose.model('Image', imageSchema);
export default Image;