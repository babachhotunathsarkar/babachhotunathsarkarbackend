import express from 'express';
import {
    sendMessage,
    getMessages,
    getChatRooms
} from '../controllers/chatController.js';

const router = express.Router();


router.post('/send', sendMessage);
router.get('/rooms', getChatRooms);
router.get('/messages/:userId', getMessages);

export default router;