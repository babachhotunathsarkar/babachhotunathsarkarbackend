import asyncHandler from 'express-async-handler';
import Schedule from '../models/Schedule.model.js';

// @desc    Get active schedules (Public)
// @route   GET /api/v1/schedules
export const getActiveSchedules = asyncHandler(async (req, res) => {
  const schedules = await Schedule.find({ isActive: true }).sort({ createdAt: 1 });
  res.status(200).json({ success: true, count: schedules.length, data: schedules });
});

// @desc    Get all schedules (Admin)
// @route   GET /api/v1/schedules/admin
export const getAllSchedules = asyncHandler(async (req, res) => {
  const schedules = await Schedule.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: schedules.length, data: schedules });
});

// @desc    Create a schedule
// @route   POST /api/v1/schedules/admin
export const createSchedule = asyncHandler(async (req, res) => {
  const { time, activity, description } = req.body;
  console.log(" req.body", req.body)
  if (!time || !activity) {
    return res.status(400).json({ success: false, message: 'Please provide time and activity' });
  }

  const schedule = await Schedule.create({ time, activity, description });
  res.status(201).json({ success: true, message: 'Schedule created', data: schedule });
});

// @desc    Update a schedule
// @route   PUT /api/v1/schedules/admin/:id
export const updateSchedule = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!schedule) {
    return res.status(404).json({ success: false, message: 'Schedule not found' });
  }

  res.status(200).json({ success: true, message: 'Schedule updated', data: schedule });
});

// @desc    Delete a schedule
// @route   DELETE /api/v1/schedules/admin/:id
export const deleteSchedule = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findByIdAndDelete(req.params.id);

  if (!schedule) {
    return res.status(404).json({ success: false, message: 'Schedule not found' });
  }

  res.status(200).json({ success: true, message: 'Schedule deleted' });
});

// @desc    Toggle schedule status
// @route   PATCH /api/v1/schedules/admin/:id/toggle
export const toggleSchedule = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id);

  if (!schedule) {
    return res.status(404).json({ success: false, message: 'Schedule not found' });
  }

  schedule.isActive = !schedule.isActive;
  await schedule.save();

  res.status(200).json({ success: true, message: `Status updated to ${schedule.isActive ? 'Active' : 'Inactive'}`, data: schedule });
});
