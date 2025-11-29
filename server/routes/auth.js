const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const { Op } = require('sequelize');
const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role, hostType } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const emailToken = crypto.randomBytes(20).toString('hex');

        // Travelers are verified by default, Hosts need verification
        const isVerified = role === 'traveler';

        const user = await User.create({
            username,
            email,
            password_hash: hashedPassword,
            role: role || 'traveler',
            host_type: role === 'host' ? hostType : null,
            is_email_verified: isVerified,
            email_verification_token: isVerified ? null : emailToken,
            email_verification_expires: isVerified ? null : Date.now() + 86400000 // 24 hours
        });

        if (role === 'host') {
            // Send verification email
            const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
            const verifyLink = `${clientUrl}/verify-email?token=${emailToken}`;
            console.log(`[EMAIL SENT] To: ${email}, Subject: Verify your email, Link: ${verifyLink}`);

            res.status(201).json({
                message: 'Registration successful. Please check your email to verify your account.',
                token: emailToken // For demo purposes
            });
        } else {
            res.status(201).json({
                message: 'Registration successful. You can now login.',
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Only enforce email verification for hosts
        if (user.role === 'host' && !user.is_email_verified) {
            return res.status(403).json({
                message: 'Email not verified. Please check your inbox.',
                isUnverified: true // Flag for frontend to show resend button
            });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, username: user.username, role: user.role, host_type: user.host_type, profile_picture: user.profile_picture } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const token = crypto.randomBytes(20).toString('hex');
        user.reset_password_token = token;
        user.reset_password_expires = Date.now() + 3600000; // 1 hour
        await user.save();

        // In a real app, send email here.
        // For demo, we return the token.
        console.log(`Reset Token for ${email}: ${token}`);
        res.json({ message: 'Password reset link sent to email.', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const user = await User.findOne({
            where: {
                reset_password_token: token,
                reset_password_expires: { [Op.gt]: Date.now() }
            }
        });

        if (!user) return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });

        user.password_hash = await bcrypt.hash(newPassword, 10);
        user.reset_password_token = null;
        user.reset_password_expires = null;
        await user.save();

        res.json({ message: 'Password has been reset.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findOne({
            where: {
                email_verification_token: token,
                email_verification_expires: { [Op.gt]: Date.now() }
            }
        });

        if (!user) return res.status(400).json({ message: 'Verification token is invalid or has expired.' });

        user.is_email_verified = true;
        user.email_verification_token = null;
        user.email_verification_expires = null;
        await user.save();

        res.json({ message: 'Email verified successfully. You can now login.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

});

router.post('/verify-invite', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const user = await User.findOne({
            where: {
                email_verification_token: token,
                email_verification_expires: { [Op.gt]: Date.now() }
            }
        });

        if (!user) return res.status(400).json({ message: 'Invitation token is invalid or has expired.' });

        user.password_hash = await bcrypt.hash(newPassword, 10);
        user.is_email_verified = true;
        user.email_verification_token = null;
        user.email_verification_expires = null;
        await user.save();

        res.json({ message: 'Account verified and password set. You can now login.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.is_email_verified) return res.status(400).json({ message: 'Email is already verified.' });

        const emailToken = crypto.randomBytes(20).toString('hex');
        user.email_verification_token = emailToken;
        user.email_verification_expires = Date.now() + 86400000; // 24 hours
        await user.save();

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const verifyLink = `${clientUrl}/verify-email?token=${emailToken}`;
        console.log(`[EMAIL SENT] To: ${email}, Subject: Verify your email, Link: ${verifyLink}`);

        res.json({ message: 'Verification email sent.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
