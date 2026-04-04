import express from 'express';
import { verifyUser } from '../middleware/auth.js';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notification.controller.js';

const router = express.Router();

router.use(verifyUser);

router.get('/', getUserNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

export default router;