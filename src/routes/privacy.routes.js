import express from 'express';
import { getPrivacyPolicy, updatePrivacyPolicy } from '../controllers/privacyController.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getPrivacyPolicy);
router.put('/', verifyAdmin, updatePrivacyPolicy);

export default router;
