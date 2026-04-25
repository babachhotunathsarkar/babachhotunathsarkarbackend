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
            topClicks: topClicks.map(c => ({ title: c._id || 'Unknown', clicks: c.count })),
            topRoutes: topRoutes.map(r => ({ path: r._id, count: r.views })),
            recentlyActiveUsers: activeProfiles.map(p => ({
                name: p.user?.name || 'Guest',
                email: p.user?.email || 'N/A',
                lastActive: p.lastActive,
                path: p.path
            }))
        });
    } catch (error) {
         console.error("Dashboard Analytics Error:", error);
         res.status(500).json({ success: false, message: "Error compiling analytics payload" });
    }
};

export const getPageViewsOverTime = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const views = await Analytics.aggregate([
            { 
                $match: { 
                    event: 'PAGE_VIEW',
                    timestamp: { $gte: startDate }
                } 
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({ success: true, data: views });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserSessions = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const sessions = await Analytics.aggregate([
            { $sort: { timestamp: -1 } },
            {
                $group: {
                    _id: "$sessionId",
                    userId: { $first: "$userId" },
                    lastActive: { $first: "$timestamp" },
                    lastPath: { $first: "$path" },
                    eventCount: { $sum: 1 }
                }
            },
            { $sort: { lastActive: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) }
        ]);

        // Populate user info if exists
        const populatedSessions = await Promise.all(sessions.map(async (s) => {
            let user = null;
            if (s.userId) {
                user = await User.findById(s.userId).select('name email');
            }
            return {
                ...s,
                name: user?.name || 'Guest',
                email: user?.email || 'N/A'
            };
        }));

        const totalEntries = await Analytics.distinct('sessionId').then(res => res.length);

        res.status(200).json({
            success: true,
            data: populatedSessions,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalEntries / parseInt(limit)),
                totalItems: totalEntries
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getRouteAnalytics = async (req, res) => {
    try {
        const routes = await Analytics.aggregate([
            { $match: { event: 'PAGE_VIEW' } },
            {
                $group: {
                    _id: "$path",
                    views: { $sum: 1 },
                    uniqueUsers: { $addToSet: "$sessionId" }
                }
            },
            {
                $project: {
                    path: "$_id",
                    views: 1,
                    uniqueUsers: { $size: "$uniqueUsers" }
                }
            },
            { $sort: { views: -1 } }
        ]);

        res.status(200).json({ success: true, data: routes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getClickAnalytics = async (req, res) => {
    try {
        const clicks = await Analytics.aggregate([
            { $match: { event: 'CLICK' } },
            {
                $group: {
                    _id: "$elementId",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({ success: true, data: clicks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
