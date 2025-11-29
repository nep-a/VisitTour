const cron = require('node-cron');
const { Op } = require('sequelize');
const Reel = require('../models/Reel');

const startCronJobs = () => {
    // Run every day at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily reel expiration check...');
        try {
            const now = new Date();
            const result = await Reel.update(
                { is_active: false },
                {
                    where: {
                        expires_at: {
                            [Op.lt]: now,
                        },
                        is_active: true,
                    },
                }
            );
            console.log(`Expired ${result[0]} reels.`);
        } catch (error) {
            console.error('Error expiring reels:', error);
        }
    });
};

module.exports = startCronJobs;
