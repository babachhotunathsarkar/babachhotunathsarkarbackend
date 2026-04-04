import express from 'express';
import { getAddress, getAllAddresses, createAddress, updateAddress, deleteAddress,  } from '../controllers/address.controller.js';
import { verifyAdmin } from '../middleware/auth.js';
 
const router = express.Router();
 
router.get('/',            getAddress);
router.get('/admin/all',   verifyAdmin, getAllAddresses);
router.post('/admin',      verifyAdmin, createAddress);
router.put('/admin/:id',   verifyAdmin, updateAddress);
router.delete('/admin/:id',verifyAdmin, deleteAddress);
 
export default router;