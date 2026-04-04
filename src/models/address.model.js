import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  street:        { type: String, required: true, trim: true },
  city:          { type: String, required: true, trim: true },
  state:         { type: String, required: true, trim: true },
  village:       { type: String, required: true, trim: true },
  contactNumber: { type: String, trim: true },
  email:         { type: String, trim: true },
  pincode:       { type: String, trim: true },
  country:       { type: String, default: 'India', trim: true },
  altPhone:      { type: String, trim: true },
  website:       { type: String, trim: true },
  mapLink:       { type: String, trim: true },
  isMain:        { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Address', addressSchema);