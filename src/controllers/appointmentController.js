import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.model.js';

export const createAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.create({
            ...req.body,
            user: req.user.id
        });

        // Create notification
        await Notification.create({
            user: req.user.id,
            title: 'Appointment Booked',
            message: `Your appointment with ${req.body.doctorName} is booked for ${req.body.appointmentDate}`,
            type: 'appointment'
        });

        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAppointments = async (req, res) => {
    try {
        let query = {};
        
        if (req.user.role !== 'admin') {
            query.user = req.user.id;
        }
        
        const appointments = await Appointment.find(query)
            .populate('user', 'name email')
            .sort('-createdAt');
        
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Check authorization
        if (req.user.role !== 'admin' && appointment.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedAppointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};