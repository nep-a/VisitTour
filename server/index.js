const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/db');
const authRoutes = require('./routes/auth');
const reelRoutes = require('./routes/reels');
const bookingRoutes = require('./routes/bookings');
const startCronJobs = require('./cron/expireReels');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [process.env.CLIENT_URL || '*', 'https://visittour.onrender.com']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', require('./routes/users'));
app.use('/api/reels', reelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/team', require('./routes/team'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/verification', require('./routes/verification'));
app.use('/api/notifications', require('./routes/notifications'));

// Database Sync and Start Server
sequelize.ensureDbExists().then(() => {
    sequelize.sync({ alter: true }).then(() => {
        console.log('Database synced');
        startCronJobs();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }).catch(err => {
        console.error('Database sync error:', err);
    });
});
