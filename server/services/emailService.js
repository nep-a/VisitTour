const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"ZuruSasa" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });
        console.log(`Email sent: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
};

exports.sendVerificationEmail = async (to, token) => {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const link = `${baseUrl}/verify-email?token=${token}`;
    const html = `
        <h1>Verify Your Email</h1>
        <p>Thank you for registering with ZuruSasa.</p>
        <p>Please click the link below to verify your email address:</p>
        <a href="${link}">${link}</a>
        <p>This link will expire in 24 hours.</p>
    `;
    return exports.sendEmail(to, 'Verify Your Email - ZuruSasa', html);
};

exports.sendPasswordResetEmail = async (to, token) => {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const link = `${baseUrl}/reset-password?token=${token}`;
    const html = `
        <h1>Reset Your Password</h1>
        <p>You requested a password reset.</p>
        <p>Please click the link below to set a new password:</p>
        <a href="${link}">${link}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
    `;
    return exports.sendEmail(to, 'Password Reset Request - ZuruSasa', html);
};

exports.sendInviteEmail = async (to, token, role) => {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const link = `${baseUrl}/verify-invite?token=${token}`;
    const html = `
        <h1>Welcome to ZuruSasa Team</h1>
        <p>You have been invited to join ZuruSasa as a <strong>${role}</strong>.</p>
        <p>Please click the link below to verify your account and set your password:</p>
        <a href="${link}">${link}</a>
        <p>This link will expire in 24 hours.</p>
    `;
    return exports.sendEmail(to, 'Invitation to Join ZuruSasa', html);
};
