import nodemailer from 'nodemailer';

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail', // You can change this to another provider
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

export const sendBookingConfirmationEmail = async (bookingDetails) => {
    try {
        const { devoteeName, tokenNumber, darbarDate, numberOfPeople, email } = bookingDetails;
        
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log("Email credentials not configured. Skipping confirmation email.");
            return;
        }

        if (!email) {
            console.log("No email provided in booking. Skipping confirmation email.");
            return;
        }

        const dateStr = new Date(darbarDate).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Sunday Darbar Token Confirmation',
            text: `Dear Devotee,

Your Darbar booking has been confirmed.

Token Number: ${tokenNumber}
Darbar Date: ${dateStr}
Number of People: ${numberOfPeople}

Please arrive before your turn.
Thank you.`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
};

export const sendContactThankYouEmail = async (userEmail, userName) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !userEmail) return;

        const transporter = createTransporter();
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Thank you for contacting Baba Chhotu Nath Sarkar Sewa Samiti',
            text: `Dear ${userName},

Thank you for your interest and for reaching out to us. 

We have received your message and Baba Chhotu Nath Sarkar Sewa Samiti will contact you soon.

Jai Baba Chhotu Nath!
With Blessings,
Temple Administration`
        };

        await transporter.sendMail(mailOptions);
        console.log(`Thank you email sent to: ${userEmail}`);
    } catch (error) {
        console.error('Error sending thank you email:', error);
    }
};

export const sendContactAdminNotification = async (contactDetails) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

        const { name, email, phone, subject, message } = contactDetails;
        const transporter = createTransporter();
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Admin receives at their own email
            subject: `New Contact Inquiry: ${subject}`,
            text: `New message from temple website:

Name: ${name}
Email: ${email}
Phone: ${phone}
Subject: ${subject}
Message:
${message}

Please respond to the devotee as soon as possible.`
        };

        await transporter.sendMail(mailOptions);
        console.log('Admin notification email sent.');
    } catch (error) {
        console.error('Error sending admin notification email:', error);
    }
};
