const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const TeamMember = require('../models/TeamMember');
const verifyToken = require('../middleware/auth');
const router = express.Router();

// Multer setup for profile pictures
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`);
    },
});
const upload = multer({ storage });

// Get current user profile
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            attributes: { exclude: ['password_hash'] }
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update profile (photo)
router.put('/me', verifyToken, upload.single('profile_picture'), async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (req.file) {
            user.profile_picture = `/uploads/${req.file.filename}`;
        }

        // Allow updating username, bio, phone_number
        if (req.body.username) user.username = req.body.username;
        if (req.body.bio) user.bio = req.body.bio;
        if (req.body.phone_number) user.phone_number = req.body.phone_number;

        await user.save();

        res.json({
            message: 'Profile updated',
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                host_type: user.host_type,
                profile_picture: user.profile_picture
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific user profile (for team members)
router.get('/profile/:id', verifyToken, async (req, res) => {
    try {
        // Check permission
        if (parseInt(req.params.id) !== req.userId) {
            const membership = await TeamMember.findOne({
                where: { host_id: req.params.id, member_id: req.userId }
            });
            if (!membership) return res.status(403).json({ message: 'Access denied' });
        }

        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password_hash'] }
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update specific user profile (for team members)
router.put('/profile/:id', verifyToken, upload.single('profile_picture'), async (req, res) => {
    try {
        // Check permission
        if (parseInt(req.params.id) !== req.userId) {
            const membership = await TeamMember.findOne({
                where: { host_id: req.params.id, member_id: req.userId }
            });
            if (!membership || membership.role !== 'admin') {
                return res.status(403).json({ message: 'Access denied. Only admins can edit profile.' });
            }
        }

        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (req.file) {
            user.profile_picture = `/uploads/${req.file.filename}`;
        }

        if (req.body.username) user.username = req.body.username;
        if (req.body.bio) user.bio = req.body.bio;
        if (req.body.phone_number) user.phone_number = req.body.phone_number;

        await user.save();

        res.json({ message: 'Profile updated', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
