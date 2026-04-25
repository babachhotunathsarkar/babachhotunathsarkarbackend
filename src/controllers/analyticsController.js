import Analytics from '../models/Analytics.model.js';
import User from '../models/user.modal.js';

export const trackEvent = async (req, res) => {
    try {
        const { sessionId, event, path, elementId, metadata } = req.body;
        
        let userId = null;
        if (req.user && req.user._id) {
             userId = req.user._id;
        }

        const newAnalytics = new Analytics({
            userId,
            sessionId,
            event,
            path,
            elementId,
            metadata
        });

        await newAnalytics.save();
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Analytics Tracking Error:", error);
        res.status(500).json({ success: false, message: "Error tracking event" });
    }
};

export const getAnalyticsDashboard = async (req, res) => {
    try {
        // Aggregate Total Events - with fallback to 0
        const totalPageViews = await Analytics.countDocuments({ event: 'PAGE_VIEW' }) || 0;
        const totalClicks = await Analytics.countDocuments({ event: 'CLICK' }) || 0;
        
        // Aggregate Unique Visitors (Unique Session IDs)
        const uniqueVisitors = await Analytics.distinct('sessionId') || [];
        const uniqueUsersCount = uniqueVisitors.length;

        // NEW: Active Sessions in Last Hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const activeSessionsLastHour = await Analytics.distinct('sessionId', { 
            timestamp: { $gte: oneHourAgo } 
        }).then(res => res.length) || 0;

        // Recently Active Logged In Users
        // Check if there are any records first
        const totalUserRecords = await Analytics.countDocuments({ userId: { $ne: null } });
        
        let activeProfiles = [];
        if (totalUserRecords > 0) {
            const recentUsers = await Analytics.aggregate([
                { $match: { userId: { $ne: null } } },
                { $sort: { timestamp: -1 } },
                { $group: { _id: "$userId", lastActive: { $first: "$timestamp" }, path: { $first: "$path" } } },
                { $limit: 10 }
            ]);

            const populatedUsers = await User.find({
                _id: { $in: recentUsers.map(u => u._id) }
            }).select('name phone email');

            activeProfiles = recentUsers.map(ru => ({
                _id: ru._id,
                lastActive: ru.lastActive,
                path: ru.path,
                user: populatedUsers.find(u => u._id && u._id.toString() === ru._id.toString()) || null
            }));
        }

        // Button Clicks Summary
        const topClicks = await Analytics.aggregate([
            { $match: { event: 'CLICK' } },
            { $group: { _id: "$elementId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]) || [];

        // Views By Route
        const topRoutes = await Analytics.aggregate([
            { $match: { event: 'PAGE_VIEW' } },
            { $group: { _id: "$path", views: { $sum: 1 } } },
            { $sort: { views: -1 } },
            { $limit: 10 }
        ]) || [];

        res.status(200).json({
            overview: {
                totalPageViews,
                totalClicks,
                uniqueUsersCount,
                activeSessionsLastHour
            },
            topClicks,
            topRoutes,
            recentlyActiveUsers: activeProfiles
        });
    } catch (error) {
         console.error("Dashboard Analytics Error:", error);
         res.status(500).json({ success: false, message: "Error compiling analytics payload" });
    }
};
