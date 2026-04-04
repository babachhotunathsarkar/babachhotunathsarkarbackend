import express from 'express';
import { body } from 'express-validator';
import {  verifyAdmin } from '../middleware/auth.js';
import { notificationValidator } from '../utils/validators.js';
import {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getNotificationStats
} from '../controllers/notification.controller.js';

const router = express.Router();

// User notification routes
router.get('/', getUserNotifications);
router.get('/stats', getNotificationStats);
router.put('/read-all', markAllAsRead);
router.delete('/clear-all', clearAllNotifications);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

// Admin routes for sending notifications
router.post('/send', verifyAdmin,
    notificationValidator,
    createNotification
);

export default router;