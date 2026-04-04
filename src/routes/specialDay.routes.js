import express from 'express';
import {
  getActiveSpecialDays,
  getAllSpecialDays,
  createSpecialDay,
  updateSpecialDay,
  deleteSpecialDay,
  toggleSpecialDay,
} from '../controllers/specialDay.controller.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getActiveSpecialDays);

// Admin routes (Protected)
router.use(verifyAdmin);
router.get('/admin', getAllSpecialDays);
router.post('/admin', createSpecialDay);
router.put('/admin/:id', updateSpecialDay);
router.delete('/admin/:id', deleteSpecialDay);
router.patch('/admin/:id/toggle', toggleSpecialDay);

export default router;
