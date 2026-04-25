import express from 'express';
import { getCookiePolicy, updateCookiePolicy } from '../controllers/cookieController.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCookiePolicy);
router.put('/', verifyAdmin, updateCookiePolicy);

export default router;
