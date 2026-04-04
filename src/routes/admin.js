import express from 'express';
import { body } from 'express-validator';
import { verifyAdmin } from '../middleware/auth.js';
import User from '../models/user.modal.js';
import Appointment from '../models/Appointment.js';
import Donation from '../models/Donation.js';
import Notification from '../models/Notification.model.js';
import { responseFormatter } from '../utils/helpers.js';

const router = express.Router();

router.use( verifyAdmin);

// ================== USER MANAGEMENT ==================

// Get all users
router.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort('-createdAt');

        const total = await User.countDocuments();

        res.json(
            responseFormatter(true, {
                users,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            })
        );
    } catch (error) {
        res.status(500).json(
            responseFormatter(false, null, error.message)
        );
    }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('notifications');

        if (!user) {
            return res.status(404).json(
                responseFormatter(false, null, 'User not found')
            );
        }

        res.json(responseFormatter(true, user));
    } catch (error) {
        res.status(500).json(
            responseFormatter(false, null, error.message)
        );
    }
});

// Update user role
router.put('/users/:id/role',
    body('role').isIn(['user', 'admin', 'doctor']),
    async (req, res) => {
        try {
            const user = await User.findByIdAndUpdate(
                req.params.id,
                { role: req.body.role },
                { new: true }
            ).select('-password');

            if (!user) {
                return res.status(404).json(
                    responseFormatter(false, null, 'User not found')
                );
            }

            res.json(
                responseFormatter(true, user, 'User role updated')
            );
        } catch (error) {
            res.status(500).json(
                responseFormatter(false, null, error.message)
            );
        }
    }
);

// Delete user
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json(
                responseFormatter(false, null, 'User not found')
            );
        }

        // Prevent deleting yourself
        if (user._id.toString() === req.user.id) {
            return res.status(400).json(
                responseFormatter(false, null, 'Cannot delete your own account')
            );
        }

        await user.deleteOne();

        res.json(
            responseFormatter(true, null, 'User deleted successfully')
        );
    } catch (error) {
        res.status(500).json(
            responseFormatter(false, null, error.message)
        );
    }
});

// ================== APPOINTMENT MANAGEMENT ==================

// Get all appointments
router.get('/appointments', async (req, res) => {
    try {
        const { status, doctorName, date } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        let query = {};

        if (status) query.status = status;
        if (doctorName) query.doctorName = new RegExp(doctorName, 'i');
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.appointmentDate = { $gte: startDate, $lt: endDate };
        }

        const appointments = await Appointment.find(query)
            .populate('user', 'name email phone')
            .skip(skip)
            .limit(limit)
            .sort('-createdAt');

        const total = await Appointment.countDocuments(query);

        res.json(
            responseFormatter(true, {
                appointments,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            })
        );
    } catch (error) {
        res.status(500).json(
            responseFormatter(false, null, error.message)
        );
    }
});

// Update appointment status
router.put('/appointments/:id/status',
    body('status').isIn(['pending', 'confirmed', 'cancelled', 'completed']),
    async (req, res) => {
        try {
            const appointment = await Appointment.findByIdAndUpdate(
                req.params.id,
                { status: req.body.status },
                { new: true }
            ).populate('user', 'name email');

            if (!appointment) {
                return res.status(404).json(
                    responseFormatter(false, null, 'Appointment not found')
                );
            }

            // Create notification for user
            if (appointment.user) {
                await Notification.create({
                    user: appointment.user._id,
                    title: 'Appointment Status Updated',
                    message: `Your appointment with ${appointment.doctorName} has been ${req.body.status}`,
                    type: 'appointment',
                    link: `/appointments/${appointment._id}`
                });
            }

            res.json(
                responseFormatter(true, appointment, 'Appointment status updated')
            );
        } catch (error) {
            res.status(500).json(
                responseFormatter(false, null, error.message)
            );
        }
    }
);

// ================== DONATION MANAGEMENT ==================

// Get all donations (already in donations.js)
// Admin can access all donations via /api/donations route

// ================== SYSTEM STATISTICS ==================

router.get('/stats', async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfYear = new Date(today.getFullYear(), 0, 1);

        // User statistics
        const totalUsers = await User.countDocuments();
        const newUsersThisMonth = await User.countDocuments({
            createdAt: { $gte: startOfMonth }
        });

        // Appointment statistics
        const totalAppointments = await Appointment.countDocuments();
        const appointmentsThisMonth = await Appointment.countDocuments({
            createdAt: { $gte: startOfMonth }
        });

        // Donation statistics
        const totalDonations = await Donation.aggregate([
            {
                $group: {
                    _id: null,
                    amount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const donationsThisMonth = await Donation.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfMonth },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    amount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Notification statistics
        const totalNotifications = await Notification.countDocuments();
        const unreadNotifications = await Notification.countDocuments({
            isRead: false
        });

        res.json(
            responseFormatter(true, {
                users: {
                    total: totalUsers,
                    thisMonth: newUsersThisMonth
                },
                appointments: {
                    total: totalAppointments,
                    thisMonth: appointmentsThisMonth
                },
                donations: {
                    total: totalDonations[0] || { amount: 0, count: 0 },
                    thisMonth: donationsThisMonth[0] || { amount: 0, count: 0 }
                },
                notifications: {
                    total: totalNotifications,
                    unread: unreadNotifications
                },
                revenue: {
                    total: totalDonations[0]?.amount || 0,
                    monthly: donationsThisMonth[0]?.amount || 0,
                    yearly: await Donation.aggregate([
                        {
                            $match: {
                                createdAt: { $gte: startOfYear },
                                status: 'completed'
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                amount: { $sum: '$amount' }
                            }
                        }
                    ]).then(result => result[0]?.amount || 0)
                }
            })
        );
    } catch (error) {
        res.status(500).json(
            responseFormatter(false, null, error.message)
        );
    }
});

// ================== SYSTEM SETTINGS ==================

// Get system settings (you can extend this)
router.get('/settings', async (req, res) => {
    try {
        const settings = {
            siteName: process.env.SITE_NAME || 'Healthcare System',
            maintenanceMode: false,
            allowRegistrations: true,
            maxAppointmentsPerDay: 50,
            minDonationAmount: 10,
            contactEmail: process.env.EMAIL_USER,
            version: '1.0.0'
        };

        res.json(responseFormatter(true, settings));
    } catch (error) {
        res.status(500).json(
            responseFormatter(false, null, error.message)
        );
    }
});

export default router;