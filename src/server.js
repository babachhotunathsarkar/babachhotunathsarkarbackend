import express from 'express';
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
import donationSettingRoutes from './routes/donationSetting.routes.js';
import privacyRoutes from './routes/privacy.routes.js';
import termsRoutes from './routes/terms.routes.js';
import cookieRoutes from './routes/cookie.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import pageContentRoutes from './routes/pageContent.routes.js';
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



// --- Diagnostic Health Check ---
app.get('/api/v1/health', (req, res) => res.status(200).json({ status: 'up', timestamp: new Date() }));

// --- Core API Routes (High Priority) ---
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/donation-settings', donationSettingRoutes);
app.use('/api/v1/page-content', pageContentRoutes);
app.use('/api/legacy/admin', adminRoutes); // Keep standard

// --- Policy Routes (Separated) ---
app.use('/api/v1/privacy', privacyRoutes);
app.use('/api/v1/terms', termsRoutes);
app.use('/api/v1/cookie', cookieRoutes);

app.use('/api/v1/admin', adminRoutes);

// --- Standard API Routes ---
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/donations', donationRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/images', imageRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/marquee', marqueeRoutes);
app.use('/api/v1/address', addrssRoutes);
app.use('/api/v1/events', eventsRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/timings', timingRoutes);
app.use('/api/v1/darbar-bookings', darbarBookingRoutes);
app.use('/api/v1/contacts', contactRoutes);
app.use('/api/v1/special-days', specialDayRoutes);
startCronJobs();
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});