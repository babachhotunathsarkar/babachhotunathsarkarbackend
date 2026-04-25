import mongoose from 'mongoose';

const donationSettingSchema = new mongoose.Schema({
    // Payment / Bank Details
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    accountHolderName: { type: String, default: '' },
    upiId: { type: String, default: '' },
    // QR Code Image URL (uploaded via cloudinary)
    qrCodeUrl: { type: String, default: '' },
    // Dynamic seva/donation fields
    sevaOptions: [{
        id: { type: String },
        name: { type: String },
        description: { type: String },
        isActive: { type: Boolean, default: true }
    }],
    // Preset donation amounts
    donationAmounts: [{ type: Number }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('DonationSetting', donationSettingSchema);
