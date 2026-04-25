import express from 'express';
import { 
    trackEvent, 
    getAnalyticsDashboard,
    getPageViewsOverTime,
    getUserSessions,
    getRouteAnalytics,
    getClickAnalytics
} from '../controllers/analyticsController.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public: track events (guests + users)
router.post('/track', trackEvent);

// Admin: view analytics dashboard
router.get('/admin/dashboard', verifyAdmin, getAnalyticsDashboard);
router.get('/page-views', verifyAdmin, getPageViewsOverTime);
router.get('/sessions', verifyAdmin, getUserSessions);
router.get('/routes', verifyAdmin, getRouteAnalytics);
router.get('/clicks', verifyAdmin, getClickAnalytics);

export default router;
