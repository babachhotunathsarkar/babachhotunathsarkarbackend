import express from 'express';
import { getMarquees, getAllMarquees, createMarquee, updateMarquee, deleteMarquee, toggleMarquee } from '../controllers/marquee.controller.js';
import { verifyAdmin } from '../middleware/auth.js';
 
const router = express.Router();
 
router.get('/', getMarquees);           // public
router.get('/admin',    verifyAdmin, getAllMarquees);
router.post('/admin',  verifyAdmin, createMarquee);
router.put('/admin/:id',    verifyAdmin, updateMarquee);
router.delete('/admin/:id', verifyAdmin, deleteMarquee);
router.patch('/admin/:id/toggle', verifyAdmin, toggleMarquee);
 
export default router;