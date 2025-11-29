const express = require('express');
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const User = require('../models/User');
const Reel = require('../models/Reel');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Ad = require('../models/Ad');
const ActionLog = require('../models/ActionLog');
const verifyToken = require('../middleware/auth');
const router = express.Router();

// Middleware to check roles
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.userRole)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
};

// --- Analytics (Admin Only) ---
router.get('/analytics', verifyToken, requireRole(['admin']), async (req, res) => {
    try {
        const { range = '7days' } = req.query;

        const totalHosts = await User.count({ where: { role: 'host' } });
        const businessHosts = await User.count({ where: { role: 'host', host_type: 'business' } });
        const individualHosts = await User.count({ where: { role: 'host', host_type: 'individual' } });
        const totalTravelers = await User.count({ where: { role: 'traveler' } });
        const totalReels = await Reel.count();
        const totalBookings = await Booking.count();
        const totalRevenue = await Booking.sum('total_price') || 0;
        const totalViews = await Reel.sum('views') || 0;

        // Average Rating
        const ratings = await Review.findAll({ attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']] });
        const avgRating = ratings[0]?.dataValues.avgRating || 0;

        // Trends
        const now = new Date();
        let startDate = new Date();

        switch (range) {
            case '30days':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90days':
                startDate.setDate(now.getDate() - 90);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            case '7days':
            default:
                startDate.setDate(now.getDate() - 7);
                break;
        }

        const bookingsTrend = await Booking.findAll({
            attributes: [
                ['booking_date', 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                booking_date: { [Op.gte]: startDate }
            },
            group: ['booking_date'],
            order: [['booking_date', 'ASC']]
        });

        res.json({
            overview: {
                totalHosts,
                businessHosts,
                individualHosts,
                totalTravelers,
                totalReels,
                totalBookings,
                totalRevenue,
                totalViews,
                avgRating: parseFloat(avgRating).toFixed(1)
            },
            trends: bookingsTrend
        });
    } catch (error) {
        console.error('[Analytics Error]', error);
        res.status(500).json({ error: error.message });
    }
});

// --- User Management (Admin Only) ---
router.post('/users', verifyToken, requireRole(['admin']), async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        // Validate role
        if (!['admin', 'sales', 'marketing'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role for staff user' });
        }

        const crypto = require('crypto');
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10); // Temporary password
        const verificationToken = crypto.randomBytes(20).toString('hex');

        const user = await User.create({
            username,
            email,
            password_hash: hashedPassword,
            role,
            is_email_verified: false,
            email_verification_token: verificationToken,
            email_verification_expires: Date.now() + 86400000 // 24 hours
        });

        // Log the invite link (simulating email)
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const inviteLink = `${clientUrl}/verify-invite?token=${verificationToken}`;
        console.log(`[EMAIL SIMULATION] Invite sent to ${email}. Link: ${inviteLink}`);

        await ActionLog.create({
            user_id: req.userId,
            action: 'CREATE_USER',
            details: `Created ${role} user: ${username}. Invite link generated.`,
            ip_address: req.ip
        });

        res.status(201).json({ message: 'User created and invite sent', user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/users', verifyToken, requireRole(['admin']), async (req, res) => {
    try {
        const users = await User.findAll({
            where: { role: { [Op.in]: ['admin', 'sales', 'marketing'] } },
            attributes: ['id', 'username', 'email', 'role', 'created_at']
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/users/:id', verifyToken, requireRole(['admin']), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Prevent modifying self role to lose admin access (optional safety)
        if (user.id === req.userId && req.body.role && req.body.role !== 'admin') {
            return res.status(400).json({ message: 'Cannot remove your own admin status' });
        }

        if (req.body.username) user.username = req.body.username;
        if (req.body.role) user.role = req.body.role;

        // Password Reset
        if (req.body.password) {
            const bcrypt = require('bcryptjs');
            user.password_hash = await bcrypt.hash(req.body.password, 10);
        }

        await user.save();

        await ActionLog.create({
            user_id: req.userId,
            action: 'UPDATE_USER',
            details: `Updated user: ${user.username} (Role: ${user.role})`,
            ip_address: req.ip
        });

        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/users/:id', verifyToken, requireRole(['admin']), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.id === req.userId) {
            return res.status(400).json({ message: 'Cannot delete yourself' });
        }

        await user.destroy();

        await ActionLog.create({
            user_id: req.userId,
            action: 'DELETE_USER',
            details: `Deleted user: ${user.username} (${user.role})`,
            ip_address: req.ip
        });

        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Marketing (Marketing & Admin) ---
router.post('/marketing/email', verifyToken, requireRole(['admin', 'marketing']), async (req, res) => {
    try {
        const { subject, message, target } = req.body; // target: 'all', 'hosts', 'travelers'

        // Log action
        await ActionLog.create({
            user_id: req.userId,
            action: 'SEND_MARKETING_EMAIL',
            details: `Subject: ${subject}, Target: ${target}`,
            ip_address: req.ip
        });

        // Mock sending
        console.log(`Sending email to ${target}: ${subject}`);

        res.json({ message: `Email campaign '${subject}' queued for ${target}.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Sales (Sales & Admin) ---
router.post('/ads', verifyToken, requireRole(['admin', 'sales']), async (req, res) => {
    try {
        const { title, image_url, link } = req.body;
        const ad = await Ad.create({
            title,
            image_url,
            link,
            created_by: req.userId
        });

        await ActionLog.create({
            user_id: req.userId,
            action: 'CREATE_AD',
            details: `Created ad: ${title}`,
            ip_address: req.ip
        });

        res.status(201).json(ad);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/ads', verifyToken, requireRole(['admin', 'sales']), async (req, res) => {
    try {
        const ads = await Ad.findAll({ include: [{ model: User, attributes: ['username'] }] });
        res.json(ads);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Logs (Admin Only) ---
router.get('/logs', verifyToken, requireRole(['admin']), async (req, res) => {
    try {
        const logs = await ActionLog.findAll({
            include: [{ model: User, attributes: ['username', 'role'] }],
            order: [['created_at', 'DESC']],
            limit: 100
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
