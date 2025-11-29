const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const verifyToken = require('../middleware/auth');
const verificationService = require('../services/verificationService');
const router = express.Router();

// Multer setup for documents
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `doc-${Date.now()}${path.extname(file.originalname)}`);
    },
});
const upload = multer({ storage });

// Upload Verification Document
router.post('/upload', verifyToken, upload.single('document'), async (req, res) => {
    try {
        const { legalName } = req.body;
        const userId = req.userId;

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.verification_status === 'verified') {
            return res.status(400).json({ message: 'User is already verified.' });
        }

        user.verification_status = 'pending';
        user.verification_document = req.file ? req.file.path : null;
        user.legal_name = legalName;
        await user.save();

        // Trigger Automated Verification
        // In a real app, this might be a background job. Here we await it for the demo response.
        const verificationResult = await verificationService.verifyDocument(user, req.file, legalName);

        if (verificationResult.success) {
            user.verification_status = 'verified';
            user.verification_feedback = 'Verification successful.';
        } else {
            user.verification_status = 'rejected';
            user.verification_feedback = verificationResult.reason;
        }
        await user.save();

        res.json({
            message: 'Verification processed',
            status: user.verification_status,
            feedback: user.verification_feedback
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Get Verification Status
router.get('/status', verifyToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            status: user.verification_status,
            feedback: user.verification_feedback,
            legalName: user.legal_name,
            hostType: user.host_type
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
