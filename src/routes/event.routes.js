import express from 'express';
import { getEvents, getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, toggleEvent } from '../controllers/event.controller.js';
import {  verifyAdmin } from '../middleware/auth.js';
 
const router = express.Router();
 
router.get('/',            getEvents);
router.get('/:id',         getEventById);
router.get('/admin/all',  verifyAdmin, getAllEvents);
router.post('/admin',      verifyAdmin, createEvent);
router.put('/admin/:id',   verifyAdmin, updateEvent);
router.delete('/admin/:id', verifyAdmin, deleteEvent);
router.patch('/admin/:id/toggle', verifyAdmin, toggleEvent);
 
export default router;