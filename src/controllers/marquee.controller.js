// src/controllers/marqueeController.js
import asyncHandler from 'express-async-handler';
import Marquee from '../models/marquee.model.js';
import Notification from '../models/Notification.model.js';
import User from '../models/user.modal.js';

// @desc  Get all marquee items (public)
// @route GET /api/marquee
export const getMarquees = asyncHandler(async (req, res) => {
  const marquees = await Marquee.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
  res.status(200).json({ success: true, data: marquees });
});

// @desc  Get all marquee items (admin - includes inactive)
// @route GET /api/admin/marquee
export const getAllMarquees = asyncHandler(async (req, res) => {
  const marquees = await Marquee.find().sort({ order: 1, createdAt: -1 });
  res.status(200).json({ success: true, data: marquees });
});

// @desc  Create marquee item
// @route POST /api/admin/marquee
export const createMarquee = asyncHandler(async (req, res) => {
  const { text, type, order, isActive } = req.body;
  if (!text) return res.status(400).json({ success: false, message: 'Text is required' });

  const marquee = await Marquee.create({ text, type: type || 'info', order: order ?? 0, isActive: isActive ?? true });

  // Create notifications for all users
  if (marquee.isActive) {
    const users = await User.find({ role: 'user' }).select('_id');
    const notifications = users.map((user) => ({
      user: user._id,
      title: '📢 नई सूचना (New Update)',
      message: text.length > 100 ? text.substring(0, 100) + '...' : text,
      type: 'notice',
      relatedId: marquee._id
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  }

  res.status(201).json({ success: true, message: 'Marquee created', data: marquee });
});

// @desc  Update marquee item
// @route PUT /api/admin/marquee/:id
export const updateMarquee = asyncHandler(async (req, res) => {
  const marquee = await Marquee.findById(req.params.id);
  if (!marquee) return res.status(404).json({ success: false, message: 'Not found' });

  const { text, type, order, isActive } = req.body;
  if (text    !== undefined) marquee.text     = text;
  if (type    !== undefined) marquee.type     = type;
  if (order   !== undefined) marquee.order    = order;
  if (isActive !== undefined) marquee.isActive = isActive;

  await marquee.save();
  res.status(200).json({ success: true, message: 'Updated', data: marquee });
});

// @desc  Delete marquee item
// @route DELETE /api/admin/marquee/:id
export const deleteMarquee = asyncHandler(async (req, res) => {
  const marquee = await Marquee.findById(req.params.id);
  if (!marquee) return res.status(404).json({ success: false, message: 'Not found' });
  await marquee.deleteOne();
  res.status(200).json({ success: true, message: 'Deleted' });
});

// @desc  Toggle active status
// @route PATCH /api/admin/marquee/:id/toggle
export const toggleMarquee = asyncHandler(async (req, res) => {
  const marquee = await Marquee.findById(req.params.id);
  if (!marquee) return res.status(404).json({ success: false, message: 'Not found' });
  marquee.isActive = !marquee.isActive;
  await marquee.save();
  res.status(200).json({ success: true, message: `Marquee ${marquee.isActive ? 'activated' : 'deactivated'}`, data: marquee });
});