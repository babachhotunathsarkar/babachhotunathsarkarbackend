import cron from 'node-cron';
import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.model.js';

export const startCronJobs = () => {
    // Run every day at 9 AM
    cron.schedule('0 9 * * *', async () => {
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const appointments = await Appointment.find({
                appointmentDate: {
                    $gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
                    $lt: new Date(tomorrow.setHours(23, 59, 59, 999))
                },
                status: 'confirmed'
            }).populate('user');

            for (const appointment of appointments) {
                await Notification.create({
                    user: appointment.user._id,
                    title: 'Appointment Reminder',
                    message: `You have an appointment tomorrow with ${appointment.doctorName} at ${appointment.appointmentTime}`,
                    type: 'appointment'
                });
            }

            console.log(`Sent ${appointments.length} appointment reminders`);
        } catch (error) {
            console.error('Cron job error:', error);
        }
    });

    // Clean old notifications every week
    cron.schedule('0 0 * * 0', async () => {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            await Notification.deleteMany({
                createdAt: { $lt: thirtyDaysAgo },
                isRead: true
            });
            
            console.log('Cleaned old notifications');
        } catch (error) {
            console.error('Cron job error:', error);
        }
    });
};