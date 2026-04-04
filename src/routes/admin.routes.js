import express from 'express';
import { verifyAdmin } from '../middleware/auth.js';

import {
    getUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    getAppointments,
    updateAppointmentStatus,
    getStats,
    getSettings
} from '../controllers/admin.controller.js';

const router = express.Router();

router.use( verifyAdmin);

router.route('/users')
    .get( getUsers);

router.route('/users/:id')
    .get( getUserById)
    .delete( deleteUser);

router.route('/users/:id/role')
    .put( updateUserRole);

// APPOINTMENTS
router.route('/appointments').get( getAppointments);
router.route('/appointments/:id/status').put( updateAppointmentStatus);

// STATS
router.route('/stats').get( getStats);

// SETTINGS
router.route('/settings').get( getSettings);

export default router;