import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorName: {
        type: String,
        required: true,
        trim: true
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    appointmentTime: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    notes: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;