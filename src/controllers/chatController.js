import { Message, ChatRoom } from '../models/Chat.js';

export const sendMessage = async (req, res) => {
    try {
        const { receiver, message } = req.body;
        const sender = req.user.id;

        // Find or create chat room
        let chatRoom = await ChatRoom.findOne({
            participants: { $all: [sender, receiver] }
        });

        if (!chatRoom) {
            chatRoom = await ChatRoom.create({
                participants: [sender, receiver]
            });
        }

        // Create message
        const newMessage = await Message.create({
            sender,
            receiver,
            message
        });

        // Update chat room
        chatRoom.lastMessage = newMessage._id;
        chatRoom.updatedAt = Date.now();
        await chatRoom.save();

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = req.user.id;

        const messages = await Message.find({
            $or: [
                { sender: currentUser, receiver: userId },
                { sender: userId, receiver: currentUser }
            ]
        }).sort('createdAt');

        // Mark messages as read
        await Message.updateMany(
            { sender: userId, receiver: currentUser, isRead: false },
            { $set: { isRead: true } }
        );

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getChatRooms = async (req, res) => {
    try {
        const chatRooms = await ChatRoom.find({
            participants: req.user.id
        })
        .populate('participants', 'name email profileImage')
        .populate('lastMessage')
        .sort('-updatedAt');

        res.json(chatRooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};