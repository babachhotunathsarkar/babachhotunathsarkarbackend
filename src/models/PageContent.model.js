import mongoose from 'mongoose';

const pageContentSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true, trim: true }, // 'privacy-policy' | 'terms-conditions'
    title: { type: String, default: '' },
    sections: [{
        heading: { type: String },
        body: { type: String },
        order: { type: Number, default: 0 }
    }],
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    contactAddress: { type: String, default: '' },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('PageContent', pageContentSchema);
