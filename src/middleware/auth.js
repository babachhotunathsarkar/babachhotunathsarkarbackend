import jwt from 'jsonwebtoken';
import User from '../models/user.modal.js';
import { asyncHandler } from "../utils/asyncHandler.js";

// ✅ User verify middleware (cookies ya Bearer token)
export const verifyUser = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.JwtToken ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token",
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedToken.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ Admin verify middleware (Standalone: verifyUser internally call karega)
export const verifyAdmin = (req, res, next) => {
  verifyUser(req, res, (err) => {
    if (err) return next(err);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not logged in",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });
    }

    next();
  });
};

// ✅ OTP verify (route handler hai, middleware nahi)
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required" });
  }

  const user = await User.findOne({ email });

  if (
    !user ||
    !user.resetOtp ||
    user.resetOtp !== parseInt(otp) ||
    user.resetOtpExpires < Date.now()
  ) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

  return res.status(200).json({
    success: true,
    message: "OTP verified",
    userId: user._id,
    token,
  });
});