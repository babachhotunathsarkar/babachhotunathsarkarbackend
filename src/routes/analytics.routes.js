import express from 'express';
import { trackEvent, getAnalyticsDashboard } from '../controllers/analyticsController.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public: track events (guests + users)
router.post('/track', trackEvent);

// Admin: view analytics dashboard
router.get('/admin/dashboard', verifyAdmin, getAnalyticsDashboard);

export default router;
