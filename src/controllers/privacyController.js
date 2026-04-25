import PrivacyPolicy from '../models/PrivacyPolicy.model.js';

export const getPrivacyPolicy = async (req, res) => {
    try {
        let policy = await PrivacyPolicy.findOne();
        if (!policy) {
            policy = await PrivacyPolicy.create({ 
                title: 'Privacy Policy', 
                content: 'Privacy Policy content coming soon...' 
            });
        }
        res.status(200).json(policy);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePrivacyPolicy = async (req, res) => {
    try {
        const { title, content } = req.body;
        let policy = await PrivacyPolicy.findOne();
        
        if (policy) {
            policy.title = title || policy.title;
            policy.content = content || policy.content;
            policy.lastUpdated = Date.now();
            await policy.save();
        } else {
            policy = await PrivacyPolicy.create({ title, content });
        }
        
        res.status(200).json({ message: 'Privacy Policy updated', policy });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
