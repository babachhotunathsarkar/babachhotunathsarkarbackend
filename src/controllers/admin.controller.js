import User from '../models/user.modal.js';
import Appointment from '../models/Appointment.js';
import Donation from '../models/Donation.js';
import Notification from '../models/Notification.js';
import { responseFormatter } from '../utils/helpers.js';

// ================= USER MANAGEMENT =================

// Get all users
export const getUsers = async (req, res) => {
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
};

// Get user by ID
export const getUserById = async (req, res) => {
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
};

// Update user role
export const updateUserRole = async (req, res) => {
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
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json(
                responseFormatter(false, null, 'User not found')
            );
        }

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
};

// ================= APPOINTMENTS =================

export const getAppointments = async (req, res) => {
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
};

export const updateAppointmentStatus = async (req, res) => {
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
};

// ================= STATS =================

export const getStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const totalUsers = await User.countDocuments();
        const totalAppointments = await Appointment.countDocuments();

        res.json(
            responseFormatter(true, {
                users: totalUsers,
                appointments: totalAppointments
            })
        );
    } catch (error) {
        res.status(500).json(
            responseFormatter(false, null, error.message)
        );
    }
};

// ================= SETTINGS =================

export const getSettings = async (req, res) => {
    try {
        const settings = {
            siteName: process.env.SITE_NAME || 'Healthcare System',
            version: '1.0.0'
        };

        res.json(responseFormatter(true, settings));
    } catch (error) {
        res.status(500).json(
            responseFormatter(false, null, error.message)
        );
    }
};