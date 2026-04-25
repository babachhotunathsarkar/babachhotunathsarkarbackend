import express from 'express';
import { getTerms, updateTerms } from '../controllers/termsController.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getTerms);
router.put('/', verifyAdmin, updateTerms);

export default router;
