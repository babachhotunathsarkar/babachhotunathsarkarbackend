import mongoose from 'mongoose';

const darbarBookingSchema = new mongoose.Schema({
  devoteeName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  numberOfPeople: {
    type: Number,
    required: true,
    min: 1,
  },
  darbarDate: {
    type: Date,
    required: true,
  },
  tokenNumber: {
    type: Number,
    required: true,
  },
  bookingTime: {
    type: String,
    required: true, // format: "HH:mm" to track and prevent duplicate minute slots if needed
  },
  notes: {
    type: String,
    default: "",
  },
}, { timestamps: true });

const DarbarBooking = mongoose.model('DarbarBooking', darbarBookingSchema);
export default DarbarBooking;
