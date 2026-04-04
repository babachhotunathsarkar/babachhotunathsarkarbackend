import Donation from '../models/Donation.js';
import Notification from '../models/Notification.model.js';
import User from '../models/user.modal.js';
import { generateRandomString } from '../utils/helpers.js';
import { responseFormatter } from '../utils/helpers.js';

export const createDonation = async (req, res) => {
    try {
        const { donorName, email, amount, paymentMethod } = req.body;
        
        // Generate transaction ID
        const transactionId = `TXN${Date.now()}${generateRandomString(8)}`;
        
        const donation = await Donation.create({
            donorName,
            email,
            amount,
            paymentMethod,
            transactionId,
            user: req.user?.id || null,
            status: paymentMethod === 'credit_card' ? 'completed' : 'pending'
        });

        // Create notification for admin
        const adminUsers = await User.find({ role: 'admin' });
        
        for (const admin of adminUsers) {
            await Notification.create({
                user: admin._id,
                title: 'New Donation Received',
                message: `${donorName} donated ₹${amount} via ${paymentMethod}. Transaction ID: ${transactionId}`,
                type: 'donation',
                link: `/admin/donations/${donation._id}`
            });
        }

        // Create notification for donor if logged in
        if (req.user) {
            await Notification.create({
                user: req.user.id,
                title: 'Donation Successful',
                message: `Thank you for your donation of ₹${amount}. Transaction ID: ${transactionId}`,
                type: 'success'
            });
        }

        // In real application, integrate with payment gateway here
        // Example: Razorpay, Stripe, PayPal

        res.status(201).json(
            responseFormatter(true, donation, 'Donation created successfully')
        );
    } catch (error) {
        res.status(500).json(
            responseFormatter(false, null, error.message)
        );
    }
};

export const getDonations = async (req, res) => {
    try {
        let query = {};
        
        // Regular users can only see their donations
        if (req.user.role !== 'admin') {
            query.user = req.user.id;
        }
        
        // Filter by status if provided
        if (req.query.status) {
            query.status = req.query.status;
        }
        
        // Filter by date range if provided
        if (req.query.startDate && req.query.endDate) {
            query.createdAt = {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate)
            };
        }

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const donations = await Donation.find(query)
            .populate('user', 'name email')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);

        const total = await Donation.countDocuments(query);
        const totalAmount = await Donation.aggregate([
            { $match: query },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        res.json(
            responseFormatter(true, {
                donations,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                totalAmount: totalAmount[0]?.total || 0
            })
        );
    } catch (error) {
        res.status(500).json(
            responseFormatter(false, null, error.message)
        );
    }
};

export const getDonationById = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id)
            .populate('user', 'name email phone');

        if (!donation) {
            return res.status(404).json(
                responseFormatter(false, null, 'Donation not found')
            );
        }

        // Check authorization
        if (req.user.role !== 'admin' && donation.user?._id.toString() !== req.user.id) {
            return res.status(403).json(
                responseFormatter(false, null, 'Not authorized')
            );
        }

        res.json(
            responseFormatter(true, donation)
        );
    } catch (error) {
        res.status(500).json(
            responseFormatter(false, null, error.message)
        );
    }
};

export const updateDonationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['pending', 'completed', 'failed'].includes(status)) {
            return res.status(400).json(
                responseFormatter(false, null, 'Invalid status')
            );
        }

        const donation = await Donation.findById(req.params.id);
        
        if (!donation) {
            return res.status(404).json(
                responseFormatter(false, null, 'Donation not found')
            );
        }

        donation.status = status;
        await donation.save();

        // Notify user if donation is completed or failed
        if (donation.user) {
            const message = status === 'completed' 
                ? `Your donation of ₹${donation.amount} has been successfully processed.`
                : `Your donation of ₹${donation.amount} has failed. Please try again.`;

            await Notification.create({
                user: donation.user,
                title: status === 'completed' ? 'Donation Completed' : 'Donation Failed',
                message,
                type: status === 'completed' ? 'success' : 'error'
            });
        }

        res.json(
            responseFormatter(true, donation, 'Donation status updated')
        );
    } catch (error) {
        res.status(500).json(
            responseFormatter(false, null, error.message)
        );
    }
};

export const getDonationStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfYear = new Date(today.getFullYear(), 0, 1);

        // Total donations
        const totalStats = await Donation.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' },
                    totalCount: { $sum: 1 }
                }
            }
        ]);

        // Monthly stats
        const monthlyStats = await Donation.aggregate([
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

        // Yearly stats
        const yearlyStats = await Donation.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfYear },
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

        // Payment method distribution
        const paymentStats = await Donation.aggregate([
            {
                $group: {
                    _id: '$paymentMethod',
                    amount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json(
            responseFormatter(true, {
                total: totalStats[0] || { totalAmount: 0, totalCount: 0 },
                monthly: monthlyStats[0] || { amount: 0, count: 0 },
                yearly: yearlyStats[0] || { amount: 0, count: 0 },
                paymentMethods: paymentStats
            })
        );
    } catch (error) {
        res.status(500).json(
            responseFormatter(false, null, error.message)
        );
    }
};