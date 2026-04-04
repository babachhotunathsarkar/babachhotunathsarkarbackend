import mongoose from 'mongoose';

const darbarBookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    default: null
},
  devoteeName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  numPeople: {
    type: Number,
    required: true,
    min: 1
  },
  darbarDate: {
    type: Date,
    required: true
  },
  tokenNumber: {
    type: Number,
    required: true
  },
  bookingTime: {
    type: Date,
    default: Date.now,
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'attended'],
    default: 'confirmed'
  }
}, { 
  timestamps: true 
});

// Compound index to prevent duplicate booking for same user on same date (optional)
darbarBookingSchema.index({ user: 1, darbarDate: 1 }, { unique: true });

// Index for token number generation and search
darbarBookingSchema.index({ darbarDate: 1, tokenNumber: 1 });

const DarbarBooking = mongoose.model('DarbarBooking', darbarBookingSchema);
export default DarbarBooking;
