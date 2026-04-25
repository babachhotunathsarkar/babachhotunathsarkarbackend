import mongoose from 'mongoose';

const cookiePolicySchema = new mongoose.Schema({
    title: { type: String, default: 'Cookie Policy' },
    content: { type: String, required: true },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('CookiePolicy', cookiePolicySchema);
