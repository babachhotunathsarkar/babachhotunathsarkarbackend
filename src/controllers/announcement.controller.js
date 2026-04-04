import Announcement from '../models/Announcement.model.js';
import Notification from '../models/Notification.model.js';
import User from '../models/user.modal.js';
// Create Announcement
const getNotificationTitle = (type) => {
  switch (type?.toLowerCase()) {
    case 'event':
      return '🎉 नया कार्यक्रम जोड़ा गया';

    case 'news':
      return '📰 नई खबर प्रकाशित हुई';

    case 'notice':
      return '⚠️ महत्वपूर्ण सूचना';

    default:
      return '📢 नई सूचना';
  }
};
export const createAnnouncement = async (req, res) => {
  try {
    const { title, description, date, type } = req.body;

    // 1. Announcement Create
    const announcement = await Announcement.create({
      title,
      description,
      date: new Date(date),
      type,
      createdBy: req.user._id
    });

    // 2. Get all users (except admin if you want)
    const users = await User.find({ role: 'user' }).select('_id');
    console.log("Users to Notify:", users.length);  
    // 3. Prepare notifications for all users
    const notifications = users.map((user) => ({
      user: user._id,
      title: getNotificationTitle(type),
      message: description.length > 150 
        ? description.substring(0, 150) + '...' 
        : description,
      type: type,
      relatedId: announcement._id
    }));
    console.log("Prepared Notifications:", notifications);
    // 4. Save all notifications in bulk (very fast)
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: `Announcement created successfully. Notifications sent to ${users.length} users.`,
      announcement
    });

  } catch (error) {
    console.error("Create Announcement Error:", error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get All Announcements (with optional type filter)
export const getAnnouncements = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};

    const announcements = await Announcement.find(filter)
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get Single Announcement
export const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Announcement not found' 
      });
    }

    res.status(200).json({ success: true, announcement });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Update Announcement
export const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    if (!announcement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Announcement not found' 
      });
    }

    res.status(200).json({ success: true, announcement });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Delete Announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Announcement not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Announcement deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};