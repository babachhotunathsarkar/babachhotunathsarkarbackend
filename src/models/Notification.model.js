import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['event', 'news', 'notice'],
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Announcement',
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// Index for faster query
notificationSchema.index({ user: 1, read: 1 });

const Notification = mongoose.model('notification', notificationSchema);
export default Notification;