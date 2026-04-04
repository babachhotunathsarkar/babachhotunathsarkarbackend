import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/user.modal.js';

export const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true
        }
    });

    const onlineUsers = new Map();

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return next(new Error('User not found'));
            }

            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.name}`);
        
        // Add user to online users
        onlineUsers.set(socket.user._id.toString(), socket.id);

        // Notify others about user online status
        socket.broadcast.emit('user-online', socket.user._id);

        // Join user to their personal room
        socket.join(socket.user._id.toString());

        // Handle sending messages
        socket.on('send-message', async (data) => {
            try {
                const { receiverId, message } = data;
                
                // Emit to receiver if online
                const receiverSocketId = onlineUsers.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('receive-message', {
                        sender: socket.user._id,
                        message,
                        timestamp: new Date()
                    });
                }

                // Emit to sender for confirmation
                socket.emit('message-sent', {
                    receiverId,
                    message,
                    timestamp: new Date()
                });
            } catch (error) {
                console.error('Send message error:', error);
            }
        });

        // Handle typing indicator
        socket.on('typing', (data) => {
            const { receiverId, isTyping } = data;
            const receiverSocketId = onlineUsers.get(receiverId);
            
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('user-typing', {
                    userId: socket.user._id,
                    isTyping
                });
            }
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.name}`);
            onlineUsers.delete(socket.user._id.toString());
            socket.broadcast.emit('user-offline', socket.user._id);
        });
    });

    return io;
};