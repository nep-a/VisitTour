const express = require('express');
const Booking = require('../models/Booking');
const Reel = require('../models/Reel');
const User = require('../models/User');
const TeamMember = require('../models/TeamMember');
const verifyToken = require('../middleware/auth');
const notificationService = require('../services/notificationService');
const { Op } = require('sequelize');
const router = express.Router();

// Create Booking
router.post('/', verifyToken, async (req, res) => {
    try {
        const { reel_id, booking_date, phone_number, traveler_name, guests, special_requests } = req.body;

        const reel = await Reel.findByPk(reel_id, {
            include: [{ model: User, attributes: ['username', 'email'] }]
        });

        if (!reel) return res.status(404).json({ message: 'Reel not found' });

        // Check for existing active booking
        const existingBooking = await Booking.findOne({
            where: {
                user_id: req.userId,
                reel_id,
                status: { [Op.notIn]: ['completed', 'cancelled'] },
                deleted_by_traveler: false
            }
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'You already have an active booking for this listing.' });
        }

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

        const user = await User.findByPk(req.userId);

        if (reel && user) {
            // Notify Traveler (Only if verified)
            if (user.is_email_verified) {
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
            }

            // Notify Host (Only if verified)
            if (reel.User.is_email_verified) {
                await notificationService.sendBookingConfirmation(
                    reel.User.email,
                    {
                        title: reel.title,
                        travelerName: traveler_name,
                        date: booking_date,
                        guests: guests,
                        price: totalPrice,
                        isHostNotification: true
                    },
                    { username: traveler_name, email: user.email }
                );
            }
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
            where: {
                user_id: req.userId,
                deleted_by_traveler: false
            },
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
                { model: Reel, include: [User] },
                { model: User }
            ]
        });

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

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

// Cancel Booking (Traveler)
router.put('/:id/cancel', verifyToken, async (req, res) => {
    try {
        const bookingId = req.params.id;
        const booking = await Booking.findByPk(bookingId, {
            include: [
                { model: Reel, include: [User] },
                { model: User }
            ]
        });

        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.user_id !== req.userId) return res.status(403).json({ message: 'Unauthorized' });
        if (booking.status === 'cancelled') return res.status(400).json({ message: 'Booking is already cancelled' });
        if (booking.status === 'completed') return res.status(400).json({ message: 'You cannot cancel a completed booking' });

        booking.status = 'cancelled';
        await booking.save();

        try {
            await notificationService.sendBookingCancellation(
                booking.Reel.User.email,
                {
                    title: booking.Reel.title,
                    travelerName: booking.User.username
                },
                booking.Reel.host_id
            );
        } catch (notifError) {
            console.error('Failed to send cancellation notification:', notifError);
        }

        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Booking (Traveler - Soft Delete)
router.put('/:id/delete', verifyToken, async (req, res) => {
    try {
        const bookingId = req.params.id;
        const booking = await Booking.findByPk(bookingId);

        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.user_id !== req.userId) return res.status(403).json({ message: 'Unauthorized' });

        booking.deleted_by_traveler = true;
        await booking.save();

        res.json({ message: 'Booking removed from your list.', booking });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Booking Date/Guests (Traveler)
router.put('/:id/update', verifyToken, async (req, res) => {
    try {
        const { newDate, guests } = req.body;
        const bookingId = req.params.id;
        const booking = await Booking.findByPk(bookingId, {
            include: [
                { model: Reel, include: [User] },
                { model: User }
            ]
        });

        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.user_id !== req.userId) return res.status(403).json({ message: 'Unauthorized' });
        if (booking.status === 'completed' || booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Cannot update a completed or cancelled booking' });
        }

        if (!booking.Reel.is_active) return res.status(400).json({ message: 'Reel is no longer active' });
        if (booking.Reel.expires_at && new Date(booking.Reel.expires_at) < new Date()) {
            return res.status(400).json({ message: 'Reel has expired' });
        }

        const price = parseFloat(booking.Reel.price) || 0;
        const guestCount = parseInt(guests) || booking.guests;
        const totalPrice = price * guestCount;

        if (newDate) booking.booking_date = newDate;
        if (guests) booking.guests = guestCount;
        booking.total_price = totalPrice;

        await booking.save();

        try {
            await notificationService.sendBookingDateUpdate(
                booking.Reel.User.email,
                {
                    title: booking.Reel.title,
                    travelerName: booking.User.username,
                    newDate: booking.booking_date
                },
                booking.Reel.host_id
            );
        } catch (notifError) {
            console.error('Failed to send update notification:', notifError);
        }

        res.json({ message: 'Booking updated successfully', booking });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
