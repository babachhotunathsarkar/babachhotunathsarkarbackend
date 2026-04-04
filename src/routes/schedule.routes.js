// routes/schedule.routes.js (Cleaner Version)
import express from 'express';
import {
  getActiveSchedules,
  getAllSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  toggleSchedule,
} from '../controllers/schedule.controller.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getActiveSchedules);

// Admin routes (with explicit /admin prefix)
router.route('/admin')
  .get(verifyAdmin, getAllSchedules)   
  .post(verifyAdmin, createSchedule);    

router.route('/admin/:id')
  .put(verifyAdmin, updateSchedule)      
  .delete(verifyAdmin, deleteSchedule);  

router.patch('/admin/:id/toggle', verifyAdmin, toggleSchedule); // PATCH /api/v1/schedules/admin/:id/toggle

export default router;