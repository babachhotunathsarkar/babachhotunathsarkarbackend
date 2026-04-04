import express from 'express';
import {
  uploadImage, uploadMultipleImages, getAllImages,
  getImageById, updateImage, deleteImage,
  bulkDeleteImages, getImagesByCategory
} from '../controllers/image.controller.js';
import { verifyAdmin } from '../middleware/auth.js';
import upload from '../config/multer.js';

const router = express.Router();

// ── Public routes ──
router.get('/', getAllImages);
router.get('/category/:category', getImagesByCategory);
router.get('/:id', getImageById);

// ── Protected routes (Admin only) ──
router.use(verifyAdmin);

router.post('/upload', upload.single('image'), uploadImage);
router.post('/upload-multiple', upload.array('images', 10), uploadMultipleImages);
router.post('/bulk-delete', bulkDeleteImages);
router.put('/:id', updateImage);
router.delete('/:id', deleteImage);

export default router;