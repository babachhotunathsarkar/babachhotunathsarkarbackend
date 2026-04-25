import express from 'express';
import { verifyUser, verifyAdmin, verifyOtp } from '../middleware/auth.js';
import {
  changeCurrentPassword,
  resetPassword,
  forgetPasswordSendEmail,
  loginUser,
  logoutUser,
  registerUser,
  getCurrentUser,
  forgetPassword,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  bulkDeleteUsers,
  getUserGrowth,
  updateUserProfile
} from "../controllers/user.controllers.js";
import upload from '../config/multer.js';
const router = express.Router();

// ── Public routes ──
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgetPasswordSendEmail);
router.post("/forgot-password-reset", verifyUser, forgetPassword);
router.post("/reset-password/:userId/:token", resetPassword);

// ── Logged-in user routes ──
router.put("/change-password", verifyUser, changeCurrentPassword);
router.post("/logout", logoutUser);
router.get("/current-user", verifyUser, getCurrentUser);
router.patch("/update-profile", verifyUser, upload.single('profileImage'), updateUserProfile);

// ── Admin routes (verifyUser + verifyAdmin dono chahiye) ──
router.get('/growth', verifyUser, verifyAdmin, getUserGrowth);
router.get('/', verifyUser, verifyAdmin, getAllUsers);
router.delete('/bulk', verifyUser, verifyAdmin, bulkDeleteUsers);
router.get('/:id', verifyUser, verifyAdmin, getUserById);
router.put('/:id/role', verifyUser, verifyAdmin, updateUserRole);
router.delete('/:id', verifyUser, verifyAdmin, deleteUser);

export default router;