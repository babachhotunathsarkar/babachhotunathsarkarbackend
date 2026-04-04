import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

// Email transporter setup
export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send email function
export const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
};

// Format date
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Generate random string
export const generateRandomString = (length = 10) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

// Upload file helper
export const uploadFile = async (file, uploadPath) => {
    return new Promise((resolve, reject) => {
        const filename = `${Date.now()}-${file.originalname}`;
        const filepath = path.join(uploadPath, filename);

        fs.writeFile(filepath, file.buffer, (error) => {
            if (error) reject(error);
            else resolve(filename);
        });
    });
};

// Calculate pagination
export const paginate = (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return { skip, limit };
};

// Response formatter
export const responseFormatter = (success, data, message = '') => {
    return {
        success,
        data,
        message,
        timestamp: new Date()
    };
};

// Currency formatter
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
    }).format(amount);
};

// Validate email
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate phone number (Indian)
export const isValidPhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
};

// Generate OTP
export const generateOTP = (length = 6) => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < length; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
};