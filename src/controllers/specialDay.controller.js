import asyncHandler from 'express-async-handler';
import SpecialDay from '../models/SpecialDay.model.js';

// @desc    Get active special days (Public)
// @route   GET /api/v1/special-days
export const getActiveSpecialDays = asyncHandler(async (req, res) => {
  const items = await SpecialDay.find({ isActive: true }).sort({ createdAt: 1 });
  res.status(200).json({ success: true, count: items.length, data: items });
});

// @desc    Get all special days (Admin)
// @route   GET /api/v1/special-days/admin
export const getAllSpecialDays = asyncHandler(async (req, res) => {
  const items = await SpecialDay.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: items.length, data: items });
});

// @desc    Create a special day
// @route   POST /api/v1/special-days/admin
export const createSpecialDay = asyncHandler(async (req, res) => {
  const { title, date, description } = req.body;

  if (!title || !date) {
    return res.status(400).json({ success: false, message: 'Please provide title and date' });
  }

  const item = await SpecialDay.create({ title, date, description });
  res.status(201).json({ success: true, message: 'Special day created', data: item });
});

// @desc    Update a special day
// @route   PUT /api/v1/special-days/admin/:id
export const updateSpecialDay = asyncHandler(async (req, res) => {
  const item = await SpecialDay.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!item) {
    return res.status(404).json({ success: false, message: 'Special day not found' });
  }

  res.status(200).json({ success: true, message: 'Special day updated', data: item });
});

// @desc    Delete a special day
// @route   DELETE /api/v1/special-days/admin/:id
export const deleteSpecialDay = asyncHandler(async (req, res) => {
  const item = await SpecialDay.findByIdAndDelete(req.params.id);

  if (!item) {
    return res.status(404).json({ success: false, message: 'Special day not found' });
  }

  res.status(200).json({ success: true, message: 'Special day deleted' });
});

// @desc    Toggle special day status
// @route   PATCH /api/v1/special-days/admin/:id/toggle
export const toggleSpecialDay = asyncHandler(async (req, res) => {
  const item = await SpecialDay.findById(req.params.id);

  if (!item) {
    return res.status(404).json({ success: false, message: 'Special day not found' });
  }

  item.isActive = !item.isActive;
  await item.save();

  res.status(200).json({ success: true, message: `Status updated to ${item.isActive ? 'Active' : 'Inactive'}`, data: item });
});
