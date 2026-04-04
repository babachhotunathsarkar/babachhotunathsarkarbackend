import mongoose from 'mongoose';

const tokenCounterSchema = new mongoose.Schema({
  darbarDate: {
    type: Date,
    required: true,
    unique: true
  },
  lastTokenNumber: {
    type: Number,
    default: 0
  }
});

const TokenCounter = mongoose.model('TokenCounter', tokenCounterSchema);
export default TokenCounter;
