import DonationSetting from '../models/DonationSetting.model.js';
import { v2 as cloudinary } from 'cloudinary';

// GET public donation settings
export const getDonationSettings = async (req, res) => {
    try {
        let settings = await DonationSetting.findOne({ isActive: true });
        if (!settings) {
            // Return default structure if none exists
            settings = {
                bankName: '', accountNumber: '', ifscCode: '',
                accountHolderName: '', upiId: '', qrCodeUrl: '',
                sevaOptions: [
                    { id: 'general', name: 'General Donation', description: 'For temple maintenance and daily worship', isActive: true },
                    { id: 'annadaan', name: 'Food Donation (Bhandara)', description: 'For prasad distribution to devotees', isActive: true },
                    { id: 'puja', name: 'Special Puja', description: 'For special rituals and worship', isActive: true },
                    { id: 'construction', name: 'Construction Seva', description: 'For temple renovation and expansion', isActive: true },
                ],
                donationAmounts: [501, 1100, 2100, 5100, 11000, 21000]
            };
        }
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching donation settings' });
    }
};

// ADMIN: Update donation settings
export const updateDonationSettings = async (req, res) => {
    try {
        const { bankName, accountNumber, ifscCode, accountHolderName, upiId, sevaOptions, donationAmounts } = req.body;

        let settings = await DonationSetting.findOne({}) || new DonationSetting({});
        if (bankName !== undefined) settings.bankName = bankName;
        if (accountNumber !== undefined) settings.accountNumber = accountNumber;
        if (ifscCode !== undefined) settings.ifscCode = ifscCode;
        if (accountHolderName !== undefined) settings.accountHolderName = accountHolderName;
        if (upiId !== undefined) settings.upiId = upiId;
        if (sevaOptions !== undefined) settings.sevaOptions = sevaOptions;
        if (donationAmounts !== undefined) settings.donationAmounts = donationAmounts;

        await settings.save();
        res.status(200).json({ message: 'Donation settings updated', settings });
    } catch (error) {
        res.status(500).json({ message: 'Error updating donation settings' });
    }
};

// ADMIN: Upload QR Code
export const uploadQRCode = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'temple/qr-codes',
            public_id: 'donation-qr',
            overwrite: true
        });

        let settings = await DonationSetting.findOne({}) || new DonationSetting({});
        settings.qrCodeUrl = result.secure_url;
        await settings.save();

        res.status(200).json({ message: 'QR code uploaded successfully', qrCodeUrl: result.secure_url });
    } catch (error) {
        console.error('QR Upload error:', error);
        res.status(500).json({ message: 'Error uploading QR code' });
    }
};
