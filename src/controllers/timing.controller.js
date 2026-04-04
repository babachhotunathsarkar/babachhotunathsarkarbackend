import asyncHandler from 'express-async-handler';
import Timing from '../models/Timing.model.js';

// @desc    Get active timings (Public)
// @route   GET /api/v1/timings
export const getActiveTimings = asyncHandler(async (req, res) => {
  const timings = await Timing.find({ isActive: true }).sort({ createdAt: 1 });
  res.status(200).json({ success: true, count: timings.length, data: timings });
});

// @desc    Get all timings (Admin)
// @route   GET /api/v1/timings/admin
export const getAllTimings = asyncHandler(async (req, res) => {
  const timings = await Timing.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: timings.length, data: timings });
});

// @desc    Create a timing
// @route   POST /api/v1/timings/admin
export const createTiming = asyncHandler(async (req, res) => {
  const { title, startTime, endTime } = req.body;

  if (!title || !startTime || !endTime) {
    return res.status(400).json({ success: false, message: 'Please provide title, startTime, and endTime' });
  }

  const timing = await Timing.create({ title, startTime, endTime });
  res.status(201).json({ success: true, message: 'Timing created', data: timing });
});

// @desc    Update a timing
// @route   PUT /api/v1/timings/admin/:id
export const updateTiming = asyncHandler(async (req, res) => {
  const timing = await Timing.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!timing) {
    return res.status(404).json({ success: false, message: 'Timing not found' });
  }

  res.status(200).json({ success: true, message: 'Timing updated', data: timing });
});

// @desc    Delete a timing
// @route   DELETE /api/v1/timings/admin/:id
export const deleteTiming = asyncHandler(async (req, res) => {
  const timing = await Timing.findByIdAndDelete(req.params.id);

  if (!timing) {
    return res.status(404).json({ success: false, message: 'Timing not found' });
  }

  res.status(200).json({ success: true, message: 'Timing deleted' });
});

// @desc    Toggle timing status
// @route   PATCH /api/v1/timings/admin/:id/toggle
export const toggleTiming = asyncHandler(async (req, res) => {
  const timing = await Timing.findById(req.params.id);

  if (!timing) {
    return res.status(404).json({ success: false, message: 'Timing not found' });
  }

  timing.isActive = !timing.isActive;
  await timing.save();

  res.status(200).json({ success: true, message: `Status updated to ${timing.isActive ? 'Active' : 'Inactive'}`, data: timing });
});
