import express from 'express';
import { 
    createContact, 
    getContacts, 
    updateContactStatus 
} from '../controllers/contact.controller.js';
import { verifyUser, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public: Submit form
router.post('/', createContact);

// Private/Admin: Manage messages
router.get('/', verifyAdmin, getContacts);
router.put('/:id', verifyAdmin, updateContactStatus);

export default router;
