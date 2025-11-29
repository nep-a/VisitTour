const express = require('express');
const Booking = require('../models/Booking');
const Reel = require('../models/Reel');
const User = require('../models/User');
const TeamMember = require('../models/TeamMember');
const verifyToken = require('../middleware/auth');
const notificationService = require('../services/notificationService');
const router = express.Router();

// Create Booking
router.post('/', verifyToken, async (req, res) => {
    try {
        const { reel_id, booking_date, phone_number, traveler_name, guests, special_requests } = req.body;

        const reel = await Reel.findByPk(reel_id, {
            include: [{ model: User, attributes: ['username', 'email'] }]
        });

        if (!reel) return res.status(404).json({ message: 'Reel not found' });

        const price = parseFloat(reel.price) || 0;
        const guestCount = parseInt(guests) || 1;

        if (guestCount <= 0) {
            return res.status(400).json({ message: 'Number of guests must be at least 1' });
        }

        const totalPrice = price * guestCount;

        const booking = await Booking.create({
            user_id: req.userId,
            host_id: reel.host_id,
            reel_id,
            booking_date,
            phone_number,
            traveler_name,
            guests: guestCount,
            total_price: totalPrice,
            special_requests
        });

        // Fetch Reel and Host details for email (already fetched above)
        // const reel = ... (removed redundant fetch)

        const user = await User.findByPk(req.userId);

        if (reel && user) {
            // Notify Traveler
            await notificationService.sendBookingConfirmation(
                user.email,
                {
                    title: reel.title,
                    travelerName: traveler_name,
                    date: booking_date,
                    guests: guests,
                    price: totalPrice
                },
                reel.User
            );

            // Notify Host
            await notificationService.sendBookingConfirmation(
                reel.User.email,
                {
                    title: reel.title,
                    travelerName: traveler_name, // In host email, this is the traveler
                    date: booking_date,
                    guests: guests,
                    price: totalPrice,
                    isHostNotification: true // Flag to distinguish content if needed, though using same template for now
                },
                { username: traveler_name, email: user.email } // "Host Details" for the host is actually Traveler Details
            );
        }

        res.status(201).json({
            booking,
            message: 'Booking successful! Confirmation email sent.'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get User Bookings
router.get('/my-bookings', verifyToken, async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            where: { user_id: req.userId },
            include: [{ model: Reel }],
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Host Bookings (for dashboard)
router.get('/host-bookings', verifyToken, async (req, res) => {
    try {
        let targetHostId = req.userId;
        if (req.query.hostId && req.query.hostId != req.userId) {
            const membership = await TeamMember.findOne({
                where: { host_id: req.query.hostId, member_id: req.userId }
            });
            if (!membership) return res.status(403).json({ message: 'Access denied' });
            targetHostId = req.query.hostId;
        }

        const bookings = await Booking.findAll({
            include: [
                {
                    model: Reel,
                    where: { host_id: targetHostId }
                },
                {
                    model: User,
                    attributes: ['username', 'email']
                }
            ],
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Booking Status (Host only)
router.put('/:id/status', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        const bookingId = req.params.id;

        const booking = await Booking.findByPk(bookingId, {
            include: [
                { model: Reel, include: [User] }, // Include Reel and Host
                { model: User } // Include Traveler
            ]
        });

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Check if the logged-in user is the host of the reel
        if (booking.Reel.host_id !== req.userId) {
            const membership = await TeamMember.findOne({
                where: { host_id: booking.Reel.host_id, member_id: req.userId }
            });
            if (!membership || (membership.role !== 'admin' && membership.role !== 'editor')) {
                return res.status(403).json({ message: 'Unauthorized. You are not the host of this booking.' });
            }
        }

        booking.status = status;
        await booking.save();

        // Notify Traveler
        if (booking.User) {
            await notificationService.sendBookingStatusUpdate(
                booking.User.email,
                {
                    title: booking.Reel.title,
                    travelerName: booking.traveler_name
                },
                status
            );
        }

        res.json({ message: 'Booking status updated', booking });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
