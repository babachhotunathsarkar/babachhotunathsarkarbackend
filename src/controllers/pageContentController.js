import PageContent from '../models/PageContent.model.js';

const DEFAULT_PRIVACY = {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    sections: [
        { heading: 'Introduction', body: 'बाबा छोटू नाथ सरकार सेवा समिति ("हम") आपकी गोपनीयता की रक्षा करने के लिए प्रतिबद्ध है। यह नीति बताती है कि हम आपकी जानकारी कैसे एकत्र और उपयोग करते हैं।\n\nBaba Chhotu Nath Sarkar Sewa Samiti ("we") is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information.', order: 0 },
        { heading: 'Information We Collect', body: 'We may collect your name, email, phone number when you register, make a donation, or contact us.', order: 1 },
        { heading: 'Data Security', body: 'We implement appropriate security measures to protect your personal information including SSL encryption and secure servers.', order: 2 },
        { heading: 'Your Rights', body: 'You have the right to access, correct, or request deletion of your personal information at any time.', order: 3 },
    ],
    contactEmail: 'privacy@babachhotunath.org',
    contactPhone: '+91 1234567890',
    contactAddress: 'Baba Chhotu Nath Temple, Badesra, Bhiwani, Haryana'
};

const DEFAULT_TERMS = {
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    sections: [
        { heading: 'Acceptance of Terms', body: 'By accessing our website, you accept these Terms & Conditions in full. If you disagree, please do not use our website.', order: 0 },
        { heading: 'Use of Website', body: 'The website is for informational purposes about the temple. You agree not to misuse the platform or its services.', order: 1 },
        { heading: 'Donations', body: 'All donations made through our platform are voluntary. Receipts will be issued for eligible donations.', order: 2 },
        { heading: 'Privacy', body: 'Your use of the website is also governed by our Privacy Policy, which is incorporated into these Terms by reference.', order: 3 },
    ],
    contactEmail: 'info@babachhotunath.org',
    contactPhone: '+91 1234567890',
    contactAddress: 'Baba Chhotu Nath Temple, Badesra, Bhiwani, Haryana'
};

const DEFAULT_REFUND = {
    slug: 'refund-policy',
    title: 'Refund Policy',
    sections: [
        { heading: 'Donation Refunds', body: 'Donations are generally non-refundable. However, if a duplicate transaction occurs, please contact us within 7 days.', order: 0 },
    ],
    contactEmail: 'info@babachhotunath.org'
};

const DEFAULT_COOKIE = {
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    sections: [
        { heading: 'What are cookies?', body: 'Cookies are small text files stored on your device to enhance your browsing experience.', order: 0 },
    ],
    contactEmail: 'info@babachhotunath.org'
};

// GET page content by slug (public)
export const getPageContent = async (req, res) => {
    try {
        let { slug } = req.params;
        if (!slug) return res.status(400).json({ message: 'Slug is required' });

        // Map short versions to full slugs
        if (slug === 'privacy') slug = 'privacy-policy';
        else if (slug === 'terms') slug = 'terms-and-conditions';
        else if (slug === 'cookie') slug = 'cookie-policy';

        console.log(`[PageContent] Fetching: ${slug}`);

        let page = await PageContent.findOne({ slug });

        if (!page) {
            console.log(`[PageContent] Seeding new page: ${slug}`);
            let defaults;
            if (slug === 'privacy-policy') defaults = DEFAULT_PRIVACY;
            else if (slug === 'terms-and-conditions') defaults = DEFAULT_TERMS;
            else if (slug === 'refund-policy') defaults = DEFAULT_REFUND;
            else if (slug === 'cookie-policy') defaults = DEFAULT_COOKIE;
            else {
                defaults = {
                    slug,
                    title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    sections: [{ heading: 'Introduction', body: 'Content is under update...', order: 0 }]
                };
            }
            
            // Use upsert to avoid race conditions
            page = await PageContent.findOneAndUpdate(
                { slug },
                { $setOnInsert: defaults },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );
        }

        res.status(200).json(page);
    } catch (error) {
        console.error("Fetch Page Content Error:", error.message, error.stack);
        res.status(500).json({ message: `Error fetching page content: ${error.message}` });
    }
};

// ADMIN: Update page content
export const updatePageContent = async (req, res) => {
    try {
        const { slug } = req.params;
        const { title, sections, contactEmail, contactPhone, contactAddress } = req.body;

        const page = await PageContent.findOneAndUpdate(
            { slug },
            { title, sections, contactEmail, contactPhone, contactAddress, lastUpdated: new Date() },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: 'Page content updated successfully', page });
    } catch (error) {
        res.status(500).json({ message: 'Error updating page content' });
    }
};
