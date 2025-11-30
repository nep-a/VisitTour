const Notification = require('../models/Notification');
const User = require('../models/User');
const emailService = require('./emailService');

/**
 * Sends email notifications and saves in-app notifications.
 */
exports.sendBookingConfirmation = async (travelerEmail, bookingDetails, hostDetails) => {
    // 1. Save Notification for Host
    try {
        if (hostDetails.id) {
            await Notification.create({
                user_id: hostDetails.id,
                title: 'New Booking',
                message: `New booking for ${bookingDetails.title} by ${bookingDetails.travelerName}.`,
                type: 'booking'
            });
        }
    } catch (err) {
        console.error('Failed to save host notification:', err);
    }

    // 2. Email to Traveler
    const travelerHtml = `
        <h1>Booking Confirmation</h1>
        <p>Dear ${bookingDetails.travelerName},</p>
        <p>Thank you for booking "<strong>${bookingDetails.title}</strong>"!</p>
        <p><strong>Date:</strong> ${bookingDetails.date}</p>
        <p><strong>Guests:</strong> ${bookingDetails.guests}</p>
        <p><strong>Total Price:</strong> Ksh ${bookingDetails.price}</p>
        <br/>
        <h3>Host Details:</h3>
        <p><strong>Name:</strong> ${hostDetails.username}</p>
        <p><strong>Email:</strong> ${hostDetails.email}</p>
        <p>The host will contact you shortly to finalize arrangements.</p>
    `;
    await emailService.sendEmail(travelerEmail, `Booking Confirmation - ${bookingDetails.title}`, travelerHtml);

    // 3. Email to Host
    if (hostDetails.email) {
        const hostHtml = `
            <h1>New Booking Received</h1>
            <p>Hello ${hostDetails.username},</p>
            <p>You have a new booking for "<strong>${bookingDetails.title}</strong>" from <strong>${bookingDetails.travelerName}</strong>.</p>
            <p>Please check your dashboard for details.</p>
        `;
        await emailService.sendEmail(hostDetails.email, `New Booking Received - ${bookingDetails.title}`, hostHtml);
    }

    return { success: true };
};

exports.sendBookingStatusUpdate = async (travelerEmail, bookingDetails, newStatus) => {
    // 1. Save Notification for Traveler
    try {
        const user = await User.findOne({ where: { email: travelerEmail } });
        if (user) {
            await Notification.create({
                user_id: user.id,
                title: 'Booking Update',
                message: `Your booking for ${bookingDetails.title} is now ${newStatus}.`,
                type: 'booking'
            });
        }
    } catch (err) {
        console.error('Failed to save traveler notification:', err);
    }

    // 2. Email to Traveler
    let statusMessage = '';
    if (newStatus === 'confirmed') {
        statusMessage = "Your booking is confirmed! The host is looking forward to seeing you.";
    } else if (newStatus === 'in_progress') {
        statusMessage = "Your experience is now in progress. Enjoy!";
    } else if (newStatus === 'completed') {
        statusMessage = "We hope you enjoyed your experience! Please leave a review.";
    } else if (newStatus === 'cancelled') {
        statusMessage = "Your booking has been cancelled.";
    }

    const html = `
        <h1>Booking Status Update</h1>
        <p>Dear ${bookingDetails.travelerName},</p>
        <p>The status of your booking for "<strong>${bookingDetails.title}</strong>" has been updated.</p>
        <h2>New Status: ${newStatus.toUpperCase()}</h2>
        <p>${statusMessage}</p>
    `;
    await emailService.sendEmail(travelerEmail, `Booking Status Update - ${bookingDetails.title}`, html);

    return { success: true };
};

exports.sendBookingCancellation = async (hostEmail, bookingDetails, hostId) => {
    // 1. Save Notification for Host
    try {
        if (hostId) {
            await Notification.create({
                user_id: hostId,
                title: 'Booking Cancelled',
                message: `Booking for ${bookingDetails.title} was cancelled by ${bookingDetails.travelerName}.`,
                type: 'booking'
            });
        }
    } catch (err) {
        console.error('Failed to save host notification:', err);
    }

    // 2. Email to Host
    const html = `
        <h1>Booking Cancelled</h1>
        <p>Hello,</p>
        <p>The booking for "<strong>${bookingDetails.title}</strong>" by <strong>${bookingDetails.travelerName}</strong> has been cancelled.</p>
    `;
    await emailService.sendEmail(hostEmail, `Booking Cancelled - ${bookingDetails.title}`, html);

    return { success: true };
};

exports.sendBookingDateUpdate = async (hostEmail, bookingDetails, hostId) => {
    // 1. Save Notification for Host
    try {
        if (hostId) {
            await Notification.create({
                user_id: hostId,
                title: 'Booking Rescheduled',
                message: `Booking date for ${bookingDetails.title} updated by ${bookingDetails.travelerName} to ${bookingDetails.newDate}.`,
                type: 'booking'
            });
        }
    } catch (err) {
        console.error('Failed to save host notification:', err);
    }

    // 2. Email to Host
    const html = `
        <h1>Booking Date Updated</h1>
        <p>Hello,</p>
        <p>The booking for "<strong>${bookingDetails.title}</strong>" by <strong>${bookingDetails.travelerName}</strong> has been rescheduled to <strong>${bookingDetails.newDate}</strong>.</p>
    `;
    await emailService.sendEmail(hostEmail, `Booking Date Updated - ${bookingDetails.title}`, html);

    return { success: true };
};
