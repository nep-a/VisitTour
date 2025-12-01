const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/db');
const authRoutes = require('./routes/auth');
const reelRoutes = require('./routes/reels');
const bookingRoutes = require('./routes/bookings');
// Cron jobs are not supported in serverless environment
// const startCronJobs = require('./cron/expireReels');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: [process.env.CLIENT_URL || '*', 'https://visittours.onrender.com', 'https://visittour.onrender.com', 'https://visit-tour-yrs8.vercel.app', 'https://visit-tour-yrs8.vercel.app/']
}));
app.use(express.json());

// NOTE: Local file uploads will NOT work on Netlify functions.
// You must use an external storage service like Cloudinary or S3.
// This line is kept for local dev but will fail or be empty on Netlify.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
// Netlify functions are served under /.netlify/functions/api usually,
// but we will configure redirects to map /api/* to the function.
const router = express.Router();
router.use('/auth', authRoutes);
router.use('/users', require('./routes/users'));
router.use('/reels', reelRoutes);
router.use('/bookings', bookingRoutes);
router.use('/reviews', require('./routes/reviews'));
router.use('/team', require('./routes/team'));
router.use('/admin', require('./routes/admin'));
router.use('/verification', require('./routes/verification'));
router.use('/notifications', require('./routes/notifications'));

app.use('/api', router);

// Database Sync (Only run if not already connected/synced to avoid overhead on every request)
// In serverless, we generally assume the DB is ready or sync lazily.
// For this setup, we'll attempt a connection check.
sequelize.authenticate().then(() => {
    console.log('Database connected');
}).catch(err => {
    console.error('Database connection error:', err);
});

// Export for Netlify
module.exports.handler = serverless(app);

// Local Server Start (Only if running directly)
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    sequelize.ensureDbExists().then(() => {
        sequelize.sync({ alter: true }).then(() => {
            console.log('Database synced');
            // startCronJobs(); // Disabled for serverless compatibility
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        }).catch(err => {
            console.error('Database sync error:', err);
        });
    });
}
