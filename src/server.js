import express, { application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import connectDB from './config/database.js';
import { setupSocket } from './config/socket.js';
import { startCronJobs } from './utils/cronJobs.js';

// Import routes
import userRoutes from './routes/user.routes.js';
import appointmentRoutes from './routes/appointments.js';
import donationRoutes from './routes/donations.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chat.js';
import imageRoutes from './routes/image.routes.js';
import videoRoutes from './routes/video.routes.js';
import marqueeRoutes from './routes/marquee.routes.js';
import addrssRoutes from './routes/address.routes.js';
import eventsRoutes from './routes/event.routes.js';
import announcementRoutes from './routes/announcement.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import scheduleRoutes from './routes/schedule.routes.js';
import timingRoutes from './routes/timing.routes.js';
import specialDayRoutes from './routes/specialDay.routes.js';
import darbarBookingRoutes from './routes/darbarBookingRoutes.js';
import contactRoutes from './routes/contact.routes.js';
// Load env vars
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = setupSocket(server);
app.set('io', io);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug Middleware
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/donations', donationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/images',imageRoutes)
app.use('/api/v1/videos',videoRoutes)
app.use('/api/v1/marquee',marqueeRoutes)
app.use('/api/v1/address', addrssRoutes)
app.use('/api/v1/events',eventsRoutes)
app.use('/api/v1/announcements',announcementRoutes)
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/timings', timingRoutes);
app.use('/api/v1/darbar-bookings', darbarBookingRoutes);
app.use('/api/v1/contacts', contactRoutes);
startCronJobs();
// server.js - After all routes, add this debug code
console.log('✅ All routes registered:');
console.log('📋 Schedules routes:', scheduleRoutes.stack?.map(r => r.route?.path));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});