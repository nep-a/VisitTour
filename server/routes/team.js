const express = require('express');
const User = require('../models/User');
const TeamMember = require('../models/TeamMember');
const verifyToken = require('../middleware/auth');
const router = express.Router();

// Get Team Members
router.get('/', verifyToken, async (req, res) => {
    try {
        const members = await TeamMember.findAll({
            where: { host_id: req.userId },
            include: [{ model: User, as: 'Member', attributes: ['id', 'username', 'email', 'profile_picture'] }]
        });
        res.json(members);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add Team Member
router.post('/', verifyToken, async (req, res) => {
    try {
        const { email, role, permissions } = req.body;

        // Find user by email
        const memberUser = await User.findOne({ where: { email } });
        if (!memberUser) {
            return res.status(404).json({ message: 'User not found. They must be registered first.' });
        }

        if (memberUser.id === req.userId) {
            return res.status(400).json({ message: 'You cannot add yourself.' });
        }

        // Check if already a member
        const existing = await TeamMember.findOne({
            where: { host_id: req.userId, member_id: memberUser.id }
        });

        if (existing) {
            return res.status(400).json({ message: 'User is already a team member.' });
        }

        const teamMember = await TeamMember.create({
            host_id: req.userId,
            member_id: memberUser.id,
            role,
            permissions
        });

        const memberWithUser = await TeamMember.findByPk(teamMember.id, {
            include: [{ model: User, as: 'Member', attributes: ['id', 'username', 'email'] }]
        });

        res.status(201).json(memberWithUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove Team Member
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const member = await TeamMember.findOne({
            where: { id: req.params.id, host_id: req.userId }
        });

        if (!member) return res.status(404).json({ message: 'Team member not found' });

        await member.destroy();
        res.json({ message: 'Team member removed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get accounts I manage
router.get('/managing', verifyToken, async (req, res) => {
    try {
        const teams = await TeamMember.findAll({
            where: { member_id: req.userId },
            include: [{ model: User, as: 'Host', attributes: ['id', 'username', 'profile_picture'] }]
        });
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
