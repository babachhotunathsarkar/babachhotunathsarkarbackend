import express from 'express';
import {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement
} from '../controllers/announcement.controller.js';

import { verifyUser, verifyAdmin } from '../middleware/auth.js';   

const router = express.Router();

// ==================== Public Routes ====================
// Koi bhi user dekh sakta hai (Event, News, Notice)
router.get('/', getAnnouncements);
router.get('/:id', getAnnouncementById);

// ==================== Protected Admin Routes ====================
// Sirf Admin hi create, update, delete kar sakta hai
router.post('/', verifyUser, verifyAdmin, createAnnouncement);
router.put('/:id', verifyUser, verifyAdmin, updateAnnouncement);
router.delete('/:id', verifyUser, verifyAdmin, deleteAnnouncement);

export default router;