import TermsAndConditions from '../models/TermsAndConditions.model.js';

export const getTerms = async (req, res) => {
    try {
        let terms = await TermsAndConditions.findOne();
        if (!terms) {
            terms = await TermsAndConditions.create({ 
                title: 'Terms & Conditions', 
                content: 'Terms and Conditions content coming soon...' 
            });
        }
        res.status(200).json(terms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTerms = async (req, res) => {
    try {
        const { title, content } = req.body;
        let terms = await TermsAndConditions.findOne();
        
        if (terms) {
            terms.title = title || terms.title;
            terms.content = content || terms.content;
            terms.lastUpdated = Date.now();
            await terms.save();
        } else {
            terms = await TermsAndConditions.create({ title, content });
        }
        
        res.status(200).json({ message: 'Terms & Conditions updated', terms });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
