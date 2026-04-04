import { body } from 'express-validator';

// User validators
export const registerValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    body('phone')
        .optional()
        .trim()
        .matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid Indian phone number')
];

// Login validator
export const loginValidator = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email'),
    
    body('password')
        .notEmpty().withMessage('Password is required')
];

// Appointment validators
export const appointmentValidator = [
    body('doctorName')
        .trim()
        .notEmpty().withMessage('Doctor name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Doctor name must be between 2 and 100 characters'),
    
    body('appointmentDate')
        .notEmpty().withMessage('Appointment date is required')
        .isISO8601().withMessage('Please provide a valid date')
        .custom((value) => {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                throw new Error('Appointment date cannot be in the past');
            }
            return true;
        }),
    
    body('appointmentTime')
        .trim()
        .notEmpty().withMessage('Appointment time is required')
        .matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Please provide a valid time in HH:MM format'),
    
    body('purpose')
        .trim()
        .notEmpty().withMessage('Purpose is required')
        .isLength({ min: 10, max: 500 }).withMessage('Purpose must be between 10 and 500 characters')
];

// Donation validators
export const donationValidator = [
    body('donorName')
        .trim()
        .notEmpty().withMessage('Donor name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Donor name must be between 2 and 100 characters'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email'),
    
    body('amount')
        .notEmpty().withMessage('Amount is required')
        .isFloat({ min: 1 }).withMessage('Amount must be at least ₹1')
        .toFloat(),
    
    body('paymentMethod')
        .trim()
        .notEmpty().withMessage('Payment method is required')
        .isIn(['credit_card', 'paypal', 'bank_transfer']).withMessage('Invalid payment method')
];

// Profile update validators
export const profileUpdateValidator = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    
    body('phone')
        .optional()
        .trim()
        .matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid Indian phone number'),
    
    body('address')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Address cannot exceed 500 characters')
];

// Chat message validator
export const chatMessageValidator = [
    body('receiver')
        .notEmpty().withMessage('Receiver ID is required')
        .isMongoId().withMessage('Invalid receiver ID'),
    
    body('message')
        .trim()
        .notEmpty().withMessage('Message is required')
        .isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters')
];

// Notification validator
export const notificationValidator = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 2, max: 100 }).withMessage('Title must be between 2 and 100 characters'),
    
    body('message')
        .trim()
        .notEmpty().withMessage('Message is required')
        .isLength({ min: 5, max: 500 }).withMessage('Message must be between 5 and 500 characters'),
    
    body('type')
        .optional()
        .isIn(['info', 'success', 'warning', 'error', 'appointment', 'donation'])
        .withMessage('Invalid notification type'),
    
    body('link')
        .optional()
        .isURL().withMessage('Please provide a valid URL')
];