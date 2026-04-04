import mongoose from 'mongoose';

const tokenSettingSchema = new mongoose.Schema({
  darbarDate: {
    type: Date,
    required: true,
    unique: true
  },
  currentTokenNumber: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const TokenSetting = mongoose.model('TokenSetting', tokenSettingSchema);
export default TokenSetting;
