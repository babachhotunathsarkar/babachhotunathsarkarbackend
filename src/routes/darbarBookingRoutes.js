import express from 'express';
import {
    createBooking,
    getAllBookings,
    resetTokens,
    deleteBooking,
    updateBooking,
    getUserBooking
} from '../controllers/darbarBookingController.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// User Routes
router.post('/book', createBooking);
router.get('/user/:phoneNumber', getUserBooking);

// Admin Routes (Protect with verifyAdmin)
router.get('/admin/all', verifyAdmin, getAllBookings);
router.post('/admin/reset-tokens', verifyAdmin, resetTokens);
router.delete('/admin/:id', verifyAdmin, deleteBooking);
router.put('/admin/:id', verifyAdmin, updateBooking);

export default router;
