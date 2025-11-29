const express = require('express');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Reel = require('../models/Reel');
const User = require('../models/User');
const TeamMember = require('../models/TeamMember');
const verifyToken = require('../middleware/auth');
const router = express.Router();

// Create Review
router.post('/', verifyToken, async (req, res) => {
    try {
        const { booking_id, rating, comment } = req.body;

        // 1. Find the booking
        const booking = await Booking.findOne({
            where: { id: booking_id, user_id: req.userId },
            include: [{ model: Reel }]
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found or not authorized.' });
        }

        // 2. Check if booking is completed
        if (booking.status !== 'completed') {
            return res.status(400).json({ message: 'You can only review completed bookings.' });
        }

        // 3. Check for existing review
        const existingReview = await Review.findOne({ where: { booking_id } });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this booking.' });
        }

        // 4. Create Review
        const review = await Review.create({
            user_id: req.userId,
            reel_id: booking.reel_id,
            booking_id,
            rating,
            comment
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reply to Review (Host only)
router.put('/:id/reply', verifyToken, async (req, res) => {
    try {
        const { reply } = req.body;
        const review = await Review.findByPk(req.params.id, {
            include: [{ model: Reel }]
        });

        if (!review) return res.status(404).json({ message: 'Review not found' });

        // Check if user is the host of the reel
        if (review.Reel.host_id !== req.userId) {
            const membership = await TeamMember.findOne({
                where: { host_id: review.Reel.host_id, member_id: req.userId }
            });
            if (!membership || (membership.role !== 'admin' && membership.role !== 'editor')) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
        }

        review.host_reply = reply;
        await review.save();

        res.json(review);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Reviews for a Reel
router.get('/reel/:reelId', async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { reel_id: req.params.reelId },
            include: [
                { model: User, attributes: ['username'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Get Reviews for Host
router.get('/host-reviews', verifyToken, async (req, res) => {
    try {
        let targetHostId = req.userId;
        if (req.query.hostId && req.query.hostId != req.userId) {
            const membership = await TeamMember.findOne({
                where: { host_id: req.query.hostId, member_id: req.userId }
            });
            if (!membership) return res.status(403).json({ message: 'Access denied' });
            targetHostId = req.query.hostId;
        }

        const reviews = await Review.findAll({
            include: [
                {
                    model: Reel,
                    where: { host_id: targetHostId },
                    attributes: ['title']
                },
                { model: User, attributes: ['username'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
