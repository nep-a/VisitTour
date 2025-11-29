/**
 * Simulates an email notification service.
 * In a real application, this would integrate with SendGrid, AWS SES, or Nodemailer.
 */
exports.sendBookingConfirmation = async (travelerEmail, bookingDetails, hostDetails) => {
    return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(() => {
            console.log("==================================================");
            console.log(`[EMAIL SENT] To: ${travelerEmail}`);
            console.log(`Subject: Booking Confirmation - ${bookingDetails.title}`);
            console.log("--------------------------------------------------");
            console.log(`Dear ${bookingDetails.travelerName},`);
            console.log("");
            console.log(`Thank you for booking "${bookingDetails.title}"!`);
            console.log(`Date: ${bookingDetails.date}`);
            console.log(`Guests: ${bookingDetails.guests}`);
            console.log(`Total Price: Ksh ${bookingDetails.price}`);
            console.log("");
            console.log("Host Details:");
            console.log(`Name: ${hostDetails.username}`);
            console.log(`Email: ${hostDetails.email}`);
            console.log("");
            console.log("The host will contact you shortly to finalize arrangements.");
            console.log("==================================================");

            resolve({ success: true });
        }, 500);
    });
};

exports.sendBookingStatusUpdate = async (travelerEmail, bookingDetails, newStatus) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("==================================================");
            console.log(`[EMAIL SENT] To: ${travelerEmail}`);
            console.log(`Subject: Booking Status Update - ${bookingDetails.title}`);
            console.log("--------------------------------------------------");
            console.log(`Dear ${bookingDetails.travelerName},`);
            console.log("");
            console.log(`The status of your booking for "${bookingDetails.title}" has been updated.`);
            console.log(`New Status: ${newStatus.toUpperCase()}`);
            console.log("");
            if (newStatus === 'confirmed') {
                console.log("Your booking is confirmed! The host is looking forward to seeing you.");
            } else if (newStatus === 'in_progress') {
                console.log("Your experience is now in progress. Enjoy!");
            } else if (newStatus === 'completed') {
                console.log("We hope you enjoyed your experience! Please leave a review.");
            }
            console.log("==================================================");
            resolve({ success: true });
        }, 500);
    });
};
