// backend/src/routes/video.routes.js
import express from 'express';
import {
  uploadVideo, uploadMultipleVideos, getAllVideos,
  getVideoById, updateVideo, deleteVideo,
  bulkDeleteVideos, getVideosByCategory,
} from '../controllers/video.controller.js';
import {  verifyAdmin } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Multer for videos ──
const uploadDir = path.join(__dirname, '../uploads/videos/');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /mp4|mkv|mov|avi|webm|flv/;
  const ext  = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype) || file.mimetype.startsWith('video/');
  if (ext && mime) return cb(null, true);
  cb(new Error('Only video files are allowed'));
};

const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
  fileFilter,
});

const router = express.Router();

// ── Public routes ──
router.get('/', getAllVideos);
router.get('/category/:category', getVideosByCategory);

// ── Protected routes ──
router.use( verifyAdmin);

router.post('/upload',          uploadMiddleware.single('video'),        uploadVideo);
router.post('/upload-multiple', uploadMiddleware.array('videos', 5),     uploadMultipleVideos);
router.post('/bulk-delete',     bulkDeleteVideos);

router.get('/:id',    getVideoById);
router.put('/:id',    updateVideo);
router.delete('/:id', deleteVideo);

export default router;