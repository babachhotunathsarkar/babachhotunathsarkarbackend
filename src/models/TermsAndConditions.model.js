import mongoose from 'mongoose';

const termsAndConditionsSchema = new mongoose.Schema({
    title: { type: String, default: 'Terms & Conditions' },
    content: { type: String, required: true },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('TermsAndConditions', termsAndConditionsSchema);
