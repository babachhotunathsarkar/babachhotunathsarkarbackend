import dotenv from "dotenv";
dotenv.config();
import asyncHandler from 'express-async-handler';
import User from '../models/user.modal.js';
import nodemailer from 'nodemailer';
import ApiResponse from "../utils/ApiResponse.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// @desc Register user
// @route POST /api/auth/register
// @access Public
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }

    let profileImage = '';
    if (req.file) {
        profileImage = req.file.filename;
    }

    const user = await User.create({ name, email, password, phone, address, profileImage });

    // Welcome Email
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'बाबा छोटू नाथ सरकार सेवा समिति में आपका स्वागत है',
            html: `<div style="text-align:center;font-family:Arial;">
                     <h2 style="color:#8B0000;">बाबा छोटू नाथ सरकार सेवा समिति</h2>
                     <p>प्रिय <strong>${name}</strong> जी,</p>
                     <p>बाबा छोटू नाथ सरकार सेवा समिति में आपका हार्दिक स्वागत है।</p>
                     <p>धन्यवाद 🙏</p>
                   </div>`
        });
    } catch (error) {
        console.log('Email not sent:', error.message);
    }

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    });
});

// @desc Login user
// @route POST /api/users/login
// @access Public
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!password || !email) {
        return res.status(400).json(new ApiResponse(400, "Email and password are required"));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json(new ApiResponse(404, "User not found"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json(new ApiResponse(401, "Invalid password"));
    }

    const JwtToken = user.generateJwtToken();
    const loggedInUser = await User.findById(user._id).select("-password");

    const options = {
        secure: true,
        maxAge: 1 * 24 * 60 * 60 * 1000,
    };

    return res
        .status(200)
        .cookie("JwtToken", JwtToken, options)
        .json(new ApiResponse(200, "User logged in successfully", { user: loggedInUser, JwtToken }));
});

// @desc Get current logged in user
// @route GET /api/users/current-user
// @access Private
export const getCurrentUser = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user?._id).select("-password");
        if (!user) {
            return res.status(404).json(new ApiResponse(404, "User not found"));
        }
        return res.status(200).json(new ApiResponse(200, "User fetched", { user }));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, error.message || "Internal Server Error"));
    }
});

// @desc Update user profile (name, phone, address, profileImage)
// @route PATCH /api/users/update-profile
// @access Private
export const updateUserProfile = asyncHandler(async (req, res) => {
    try {
       
        
        const userId = req.user?._id;
        const { name, phone, address } = req.body || {};

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json(new ApiResponse(404, "User not found"));
        }

        console.log('Current user data:', {
            id: user._id,
            name: user.name,
            phone: user.phone,
            address: user.address,
            profileImage: user.profileImage
        });

        // Handle profile image upload to Cloudinary (if file uploaded)
        if (req.file) {
            console.log('Processing file upload to Cloudinary...');
            try {
                const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'baba-chhotu-nath/profiles',
                    transformation: [{ width: 400, height: 400, crop: 'fill' }]
                });
                
                console.log('Cloudinary upload success:', uploadResult.secure_url);
                user.profileImage = uploadResult.secure_url;
                
                // Delete local temp file
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                    console.log('Local temp file deleted:', req.file.path);
                }
            } catch (uploadErr) {
                console.error('Cloudinary upload error:', uploadErr);
                // Continue without image update if upload fails
                return res.status(400).json(new ApiResponse(400, "Failed to upload image: " + uploadErr.message));
            }
        }

        // Update fields if provided
        let updated = false;
        if (name && name.trim()) {
            user.name = name.trim();
            updated = true;
        }
        if (phone && phone.trim()) {
            user.phone = phone.trim();
            updated = true;
        }
        if (address && address.trim()) {
            user.address = address.trim();
            updated = true;
        }

        if (updated || req.file) {
            user.updatedAt = new Date();
            await user.save();
            console.log('User updated successfully');
        }

        const updatedUser = await User.findById(userId).select("-password");
        
      

        return res.status(200).json(new ApiResponse(200, "Profile updated successfully", { user: updatedUser }));
    } catch (error) {
        console.error('updateUserProfile error:', error);
        res.status(500).json(new ApiResponse(500, error.message || "Internal Server Error"));
    }
});

// @desc Forgot password — send OTP
// @route POST /api/users/forgot-password
// @access Public
export const forgetPasswordSendEmail = asyncHandler(async (req, res) => {
    const email = req.body.email;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ success: false, message: "This email is not registered." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
            tls: { rejectUnauthorized: false },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset OTP",
            html: `<p>Dear User,</p>
                   <p>Your OTP for password reset is:</p>
                   <div style="font-size:32px;font-weight:bold;color:#d9534f;">${otp}</div>
                   <p>This OTP is valid for 10 minutes.</p>`
        });

        return res.status(200).json({ success: true, message: `OTP sent to ${user.email}`, userId: user._id.toString() });
    } catch (err) {
        console.error("Email Sending Error:", err);
        return res.status(500).json({ success: false, message: "Error sending email" });
    }
});

// @desc Reset password with OTP
// @route POST /api/users/forgotpassword
// @access Public
export const forgetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const userId = req.user?._id;

    if (!userId || !password) {
        return res.status(400).json({ success: false, message: "Authentication required and Password required" });
    }

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    user.password = password;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successfully" });
});

// @desc Reset password via token link
// @route POST /api/users/reset-password/:id/:token
// @access Public
export const resetPassword = asyncHandler(async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;

    if (!id || !token || !password) {
        return res.status(400).json(new ApiResponse(400, "Invalid request"));
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json(new ApiResponse(404, "User not found"));
    if (!user.resetToken || user.resetToken !== token) {
        return res.status(400).json(new ApiResponse(400, "Invalid reset link"));
    }
    if (user.resetTokenExpire < Date.now()) {
        return res.status(400).json(new ApiResponse(400, "Reset link expired"));
    }

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    return res.status(200).json(new ApiResponse(200, "Password reset successfully"));
});

// @desc Change current password
// @route PUT /api/users/change-password
// @access Private
export const changeCurrentPassword = asyncHandler(async (req, res) => {
    try {
        const userId = req.user?._id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json(new ApiResponse(400, "All fields are required"));
        }

        const user = await User.findById(userId);
        if (!user || !(await user.comparePassword(oldPassword))) {
            return res.status(401).json(new ApiResponse(401, "Invalid old password"));
        }

        user.password = newPassword;
        await user.save();

        res.json(new ApiResponse(200, "Password changed successfully"));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, error.message || "Internal Server Error"));
    }
});

// @desc Logout user
// @route POST /api/users/logout
// @access Private
export const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie("JwtToken");
    res.status(200).json(new ApiResponse(200, "User logged out successfully"));
});

// ── Admin Controllers ──────────────────────────────────────────────────────

export const getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, role, search } = req.query;
    let query = {};
    if (role && role !== 'all') query.role = role;
    if (search) {
        query.$or = [
            { name:  { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 })
        .limit(limit * 1).skip((page - 1) * limit);
    const total = await User.countDocuments(query);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [totalUsers, totalAdmins, thisMonth] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ role: 'admin' }),
        User.countDocuments({ createdAt: { $gte: startOfMonth } }),
    ]);

    res.status(200).json({
        success: true,
        data: users,
        stats: { totalUsers, totalAdmins, verified: 0, thisMonth },
        pagination: { currentPage: Number(page), totalPages: Math.ceil(total / limit), totalItems: total, itemsPerPage: Number(limit) },
    });
});

export const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
});

export const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.role = role;
    await user.save();
    res.status(200).json({ success: true, message: 'Role updated', data: user });
});

export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted' });
});

export const bulkDeleteUsers = asyncHandler(async (req, res) => {
    const { userIds } = req.body;
    if (!userIds || !Array.isArray(userIds)) {
        return res.status(400).json({ success: false, message: 'Invalid user IDs' });
    }
    const result = await User.deleteMany({ _id: { $in: userIds } });
    res.status(200).json({ success: true, message: `${result.deletedCount} users deleted`, deletedCount: result.deletedCount });
});

export const getUserGrowth = asyncHandler(async (req, res) => {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const growth = await User.aggregate([
        { $match: { createdAt: { $gte: twelveMonthsAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $limit: 12 },
    ]);

    const formatted = growth.map(item => {
        const [, mm] = item._id.split('-');
        return { month: MONTH_NAMES[parseInt(mm, 10) - 1] ?? item._id, count: item.count, _id: item._id };
    });

    res.status(200).json({ success: true, data: formatted });
});