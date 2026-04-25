import mongoose from 'mongoose';

const privacyPolicySchema = new mongoose.Schema({
    title: { type: String, default: 'Privacy Policy' },
    content: { type: String, required: true },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('PrivacyPolicy', privacyPolicySchema);
