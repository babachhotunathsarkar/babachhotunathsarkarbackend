import express from 'express';
import { getPageContent, updatePageContent } from '../controllers/pageContentController.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public
router.get('/:slug', getPageContent);

// Admin
router.put('/admin/:slug', verifyAdmin, updatePageContent);

export default router;
