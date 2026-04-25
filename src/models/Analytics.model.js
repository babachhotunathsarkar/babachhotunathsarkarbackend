import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    sessionId: { type: String, required: true }, // Guest tracking token
    event: { type: String, required: true }, // 'PAGE_VIEW' or 'CLICK'
    path: { type: String, required: true }, // current route (e.g. '/donate')
    elementId: { type: String, default: null }, // ID of the button clicked if any
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }, // IP addr, UserAgent
    timestamp: { type: Date, default: Date.now },
});

// Indexing for faster aggregation queries
analyticsSchema.index({ event: 1, path: 1, timestamp: -1 });
analyticsSchema.index({ sessionId: 1 });

export default mongoose.model('Analytics', analyticsSchema);
