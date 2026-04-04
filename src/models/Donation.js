import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    donorName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'paypal', 'bank_transfer'],
        required: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Donation = mongoose.model('Donation', donationSchema);
export default Donation;