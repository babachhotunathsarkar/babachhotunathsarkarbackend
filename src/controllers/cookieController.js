import CookiePolicy from '../models/CookiePolicy.model.js';

export const getCookiePolicy = async (req, res) => {
    try {
        let policy = await CookiePolicy.findOne();
        if (!policy) {
            policy = await CookiePolicy.create({ 
                title: 'Cookie Policy', 
                content: 'Cookie Policy content coming soon...' 
            });
        }
        res.status(200).json(policy);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCookiePolicy = async (req, res) => {
    try {
        const { title, content } = req.body;
        let policy = await CookiePolicy.findOne();
        
        if (policy) {
            policy.title = title || policy.title;
            policy.content = content || policy.content;
            policy.lastUpdated = Date.now();
            await policy.save();
        } else {
            policy = await CookiePolicy.create({ title, content });
        }
        
        res.status(200).json({ message: 'Cookie Policy updated', policy });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
