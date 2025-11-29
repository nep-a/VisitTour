/**
 * Simulates AI Content Moderation for Reels.
 * In a real application, this would integrate with AWS Rekognition Video or Google Cloud Video Intelligence.
 */
exports.moderateReel = async (reel) => {
    return new Promise((resolve) => {
        // Simulate processing delay
        setTimeout(async () => {
            try {
                const title = reel.title.toLowerCase();
                const description = (reel.description || '').toLowerCase();

                // 1. Check for irrelevant content keywords
                const irrelevantKeywords = ['spam', 'casino', 'gamble', 'crypto', 'forex', 'adult'];
                const isIrrelevant = irrelevantKeywords.some(kw => title.includes(kw) || description.includes(kw));

                if (isIrrelevant) {
                    return resolve({
                        approved: false,
                        reason: 'Content flagged as irrelevant to tourism or violates community guidelines.'
                    });
                }

                // 2. Check for low quality (simulated by keyword in title)
                if (title.includes('test') || title.includes('demo')) {
                    // Maybe allow tests but flag them? For now let's reject "low quality" if explicitly named so.
                    // Actually, let's just approve generic stuff.
                }

                // 3. Success
                resolve({
                    approved: true
                });

            } catch (error) {
                console.error("Moderation Error:", error);
                resolve({
                    approved: false,
                    reason: 'Moderation service error.'
                });
            }
        }, 1500); // 1.5 second delay
    });
};
