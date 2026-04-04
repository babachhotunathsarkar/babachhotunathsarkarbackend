import express from 'express';
import {
    createAppointment,
    getAppointments,
    updateAppointment
} from '../controllers/appointmentController.js';

const router = express.Router();


router.route('/')
    .post(createAppointment)
    .get(getAppointments);

router.route('/:id')
    .put(updateAppointment);

export default router;