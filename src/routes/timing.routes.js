import express from 'express';
import {
  getActiveTimings,
  getAllTimings,
  createTiming,
  updateTiming,
  deleteTiming,
  toggleTiming,
} from '../controllers/timing.controller.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getActiveTimings);

// Admin routes (Protected)
router.use(verifyAdmin);
router.get('/admin', getAllTimings);
router.post('/admin', createTiming);
router.put('/admin/:id', updateTiming);
router.delete('/admin/:id', deleteTiming);
router.patch('/admin/:id/toggle', toggleTiming);

export default router;
