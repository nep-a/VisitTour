const express = require('express');
const Notification = require('../models/Notification');
const verifyToken = require('../middleware/auth');
const router = express.Router();

// Get User Notifications
router.get('/', verifyToken, async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { user_id: req.userId },
            order: [['created_at', 'DESC']],
            limit: 20
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark as Read
router.put('/:id/read', verifyToken, async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: { id: req.params.id, user_id: req.userId }
        });
        if (notification) {
            notification.is_read = true;
            await notification.save();
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
