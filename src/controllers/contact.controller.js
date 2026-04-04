import Contact from '../models/Contact.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendContactThankYouEmail, sendContactAdminNotification } from '../utils/mailer.js';

// @desc    Submit a new contact form
// @route   POST /api/contacts
// @access  Public
export const createContact = asyncHandler(async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        res.status(400);
        throw new Error('Please provide all required fields (name, email, subject, message)');
    }

    const contact = await Contact.create({
        name,
        email,
        phone,
        subject,
        message
    });

    if (contact) {
        // Send emails asynchronously
        sendContactThankYouEmail(email, name);
        sendContactAdminNotification({ name, email, phone, subject, message });

        res.status(201).json({
            success: true,
            data: contact,
            message: 'Message sent successfully'
        });
    } else {
        res.status(400);
        throw new Error('Invalid contact data');
    }
});

// @desc    Get all contact messages (for admin)
// @route   GET /api/contacts
// @access  Private/Admin
export const getContacts = asyncHandler(async (req, res) => {
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    res.json({
        success: true,
        data: contacts
    });
});

// @desc    Update contact status
// @route   PUT /api/contacts/:id
// @access  Private/Admin
export const updateContactStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (contact) {
        contact.status = status || contact.status;
        const updatedContact = await contact.save();
        res.json({
            success: true,
            data: updatedContact
        });
    } else {
        res.status(404);
        throw new Error('Contact message not found');
    }
});
