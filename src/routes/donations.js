import express from 'express';
import { body } from 'express-validator';

import { donationValidator } from '../utils/validators.js';
import {
    createDonation,
    getDonations,
    getDonationById,
    updateDonationStatus,
    getDonationStats
} from '../controllers/donationController.js';
import { verifyUser, verifyAdmin, verifyOtp } from '../middleware/auth.js';
const router = express.Router();

// Public route for donations (can be used without login)
router.post('/',
    donationValidator,
    createDonation
);


router.get('/', getDonations);
router.get('/stats', getDonationStats);
router.get('/:id', getDonationById);

// Admin only routes
router.put('/:id/status', verifyAdmin, 
    body('status').isIn(['pending', 'completed', 'failed']),
    updateDonationStatus
);

export default router;