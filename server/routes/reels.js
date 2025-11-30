const express = require('express');
const multer = require('multer');
const path = require('path');
const { Op } = require('sequelize');
const Reel = require('../models/Reel');
const User = require('../models/User');
const TeamMember = require('../models/TeamMember');
const Like = require('../models/Like');
const verifyToken = require('../middleware/auth');

const moderationService = require('../services/moderationService');
const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// Create Reel
router.post('/', verifyToken, upload.single('video'), async (req, res) => {
    try {
        if (req.userRole !== 'host' && req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Only hosts can upload reels' });
        }

        // Check Verification Status
        const user = await User.findByPk(req.userId);
        if (user.verification_status !== 'verified') {
            return res.status(403).json({
                message: 'Account not verified. Please complete identity verification to publish reels.',
                verificationStatus: user.verification_status
            });
        }

        const { title, description, location, price, category } = req.body;
        // 90 days expiration
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 90);

        const reel = await Reel.create({
            host_id: req.userId,
            video_url: req.file ? `/uploads/${req.file.filename}` : '',
            title,
            description,
            location,
            price,
            category,
            expires_at: expiresAt,
            moderation_status: 'pending'
        });

        // Trigger Automated Moderation
        const moderationResult = await moderationService.moderateReel(reel);
        reel.moderation_status = moderationResult.approved ? 'approved' : 'rejected';
        reel.moderation_feedback = moderationResult.reason || '';

        // If rejected, maybe set is_active to false
        if (!moderationResult.approved) {
            reel.is_active = false;
        }

        await reel.save();

        res.status(201).json(reel);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Feed / Search
router.get('/', async (req, res) => {
    try {
        const { location, category, minPrice, maxPrice, search, page = 1, limit = 5 } = req.query;
        const where = { is_active: true };

        if (location) where.location = { [Op.like]: `%${location}%` };
        if (category) where.category = category;
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = minPrice;
            if (maxPrice) where.price[Op.lte] = maxPrice;
        }
        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
            ];
        }

        const offset = (page - 1) * limit;

        const reels = await Reel.findAll({
            where,
            include: [{ model: User, attributes: ['username', 'profile_picture'] }],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
        res.json(reels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Reel by ID
router.get('/:id', async (req, res) => {
    try {
        const reel = await Reel.findByPk(req.params.id, {
            include: [{ model: User, attributes: ['username', 'profile_picture'] }],
        });
        if (!reel) return res.status(404).json({ message: 'Reel not found' });
        res.json(reel);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Increment View Count
router.post('/:id/view', async (req, res) => {
    try {
        const reel = await Reel.findByPk(req.params.id);
        if (!reel) return res.status(404).json({ message: 'Reel not found' });

        reel.views += 1;
        await reel.save();

        res.json({ views: reel.views });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Toggle Like
router.post('/:id/like', verifyToken, async (req, res) => {
    try {
        const reelId = req.params.id;
        const userId = req.userId;

        const reel = await Reel.findByPk(reelId);
        if (!reel) return res.status(404).json({ message: 'Reel not found' });

        const existingLike = await Like.findOne({
            where: { reel_id: reelId, user_id: userId }
        });

        if (existingLike) {
            await existingLike.destroy();
            reel.likes_count = Math.max(0, reel.likes_count - 1);
            await reel.save();
            return res.json({ message: 'Unliked', likes_count: reel.likes_count, liked: false });
        } else {
            await Like.create({ reel_id: reelId, user_id: userId });
            reel.likes_count += 1;
            await reel.save();
            return res.json({ message: 'Liked', likes_count: reel.likes_count, liked: true });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check if user liked reel
router.get('/:id/is-liked', verifyToken, async (req, res) => {
    try {
        const reelId = req.params.id;
        const userId = req.userId;

        const like = await Like.findOne({
            where: { reel_id: reelId, user_id: userId }
        });

        res.json({ liked: !!like });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Host Analytics
router.get('/host/analytics', verifyToken, async (req, res) => {
    try {
        let targetHostId = req.userId;
        if (req.query.hostId && req.query.hostId != req.userId) {
            // Check permission
            const membership = await TeamMember.findOne({
                where: { host_id: req.query.hostId, member_id: req.userId }
            });
            if (!membership) return res.status(403).json({ message: 'Access denied' });
            targetHostId = req.query.hostId;
        }

        const reels = await Reel.findAll({
            where: { host_id: targetHostId },
            attributes: ['id', 'title', 'views', 'likes_count', 'created_at']
        });

        const totalViews = reels.reduce((sum, reel) => sum + reel.views, 0);
        const totalLikes = reels.reduce((sum, reel) => sum + reel.likes_count, 0);
        const topReels = [...reels].sort((a, b) => b.views - a.views).slice(0, 5);

        res.json({
            totalViews,
            totalLikes,
            totalReels: reels.length,
            topReels
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Host Reels
router.get('/host/all', verifyToken, async (req, res) => {
    try {
        let targetHostId = req.userId;
        if (req.query.hostId && req.query.hostId != req.userId) {
            const membership = await TeamMember.findOne({
                where: { host_id: req.query.hostId, member_id: req.userId }
            });
            if (!membership) return res.status(403).json({ message: 'Access denied' });
            targetHostId = req.query.hostId;
        }

        const reels = await Reel.findAll({
            where: { host_id: targetHostId },
            order: [['created_at', 'DESC']]
        });
        res.json(reels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Reel
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const reel = await Reel.findByPk(req.params.id);
        if (!reel) return res.status(404).json({ message: 'Reel not found' });

        if (reel.host_id !== req.userId) {
            // Check team permission
            const membership = await TeamMember.findOne({
                where: { host_id: reel.host_id, member_id: req.userId }
            });
            if (!membership || (membership.role !== 'admin' && membership.role !== 'editor')) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        if (!reel) return res.status(404).json({ message: 'Reel not found' });

        const { title, description, price, category, is_active } = req.body;

        if (title) reel.title = title;
        if (description) reel.description = description;
        if (price) reel.price = price;
        if (category) reel.category = category;
        if (is_active !== undefined) reel.is_active = is_active;

        await reel.save();
        res.json(reel);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Reel
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const reel = await Reel.findByPk(req.params.id);
        if (!reel) return res.status(404).json({ message: 'Reel not found' });

        if (reel.host_id !== req.userId) {
            const membership = await TeamMember.findOne({
                where: { host_id: reel.host_id, member_id: req.userId }
            });
            if (!membership || membership.role !== 'admin') {
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        if (!reel) return res.status(404).json({ message: 'Reel not found' });

        await reel.destroy();
        res.json({ message: 'Reel deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
