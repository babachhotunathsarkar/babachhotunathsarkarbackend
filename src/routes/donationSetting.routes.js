import express from 'express';
import { getDonationSettings, updateDonationSettings, uploadQRCode } from '../controllers/donationSettingController.js';
import { verifyAdmin } from '../middleware/auth.js';
import upload from '../config/multer.js';

const router = express.Router();

// Public
router.get('/', getDonationSettings);

// Admin
router.put('/update', verifyAdmin, updateDonationSettings);
router.post('/upload-qr', verifyAdmin, upload.single('qrCode'), uploadQRCode);

export default router;
