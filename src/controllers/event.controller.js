// src/controllers/eventController.js
import asyncHandler from 'express-async-handler';
import Event from '../models/event.model.js';
import Notification from '../models/Notification.model.js';
import User from '../models/user.modal.js';

// @desc  Get all active events (public)
// @route GET /api/events
export const getEvents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category } = req.query;
  const query = { isActive: true };
  if (category && category !== 'all') query.category = category;

  const events = await Event.find(query)
    .sort({ eventDate: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Event.countDocuments(query);
  res.status(200).json({
    success: true, data: events,
    pagination: { currentPage: Number(page), totalPages: Math.ceil(total / limit), totalItems: total, itemsPerPage: Number(limit) },
  });
});

// @desc  Get all events (admin)
// @route GET /api/admin/events
export const getAllEvents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, category } = req.query;
  const query = {};
  if (category && category !== 'all') query.category = category;
  if (search) query.$or = [
    { title:       { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } },
    { location:    { $regex: search, $options: 'i' } },
  ];

  const events = await Event.find(query)
    .sort({ eventDate: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Event.countDocuments(query);
  res.status(200).json({
    success: true, data: events,
    pagination: { currentPage: Number(page), totalPages: Math.ceil(total / limit), totalItems: total, itemsPerPage: Number(limit) },
  });
});

// @desc  Get single event
// @route GET /api/events/:id
export const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  res.status(200).json({ success: true, data: event });
});

// @desc  Create event
// @route POST /api/admin/events
export const createEvent = asyncHandler(async (req, res) => {
  const { title, description, eventDate, eventTime, location, category, isActive } = req.body;
  if (!title || !eventDate) return res.status(400).json({ success: false, message: 'Title and date required' });

  const event = await Event.create({
    title, description, eventDate, eventTime,
    location, category: category || 'general',
    isActive: isActive ?? true,
  });

  // Create notifications for all users
  if (event.isActive) {
    const users = await User.find({ role: 'user' }).select('_id');
    const notifications = users.map((user) => ({
      user: user._id,
      title: '📅 नया कार्यक्रम (New Event)',
      message: `${title} - ${new Date(eventDate).toLocaleDateString()}`,
      type: 'event',
      relatedId: event._id
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  }

  res.status(201).json({ success: true, message: 'Event created', data: event });
});

// @desc  Update event
// @route PUT /api/admin/events/:id
export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

  const fields = ['title', 'description', 'eventDate', 'eventTime', 'location', 'category', 'isActive'];
  fields.forEach(f => { if (req.body[f] !== undefined) event[f] = req.body[f]; });

  await event.save();
  res.status(200).json({ success: true, message: 'Updated', data: event });
});

// @desc  Delete event
// @route DELETE /api/admin/events/:id
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  await event.deleteOne();
  res.status(200).json({ success: true, message: 'Event deleted' });
});

// @desc  Toggle active
// @route PATCH /api/admin/events/:id/toggle
export const toggleEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  event.isActive = !event.isActive;
  await event.save();
  res.status(200).json({ success: true, message: `Event ${event.isActive ? 'activated' : 'deactivated'}`, data: event });
});