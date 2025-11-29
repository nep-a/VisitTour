const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    profile_picture: {
        type: DataTypes.STRING,
    },
    bio: {
        type: DataTypes.TEXT,
    },
    phone_number: {
        type: DataTypes.STRING,
    },
    role: {
        type: DataTypes.ENUM('traveler', 'host', 'admin', 'sales', 'marketing'),
        defaultValue: 'traveler',
    },
    host_type: {
        type: DataTypes.ENUM('individual', 'business'),
        allowNull: true,
    },
    verification_status: {
        type: DataTypes.ENUM('unverified', 'pending', 'verified', 'rejected'),
        defaultValue: 'unverified',
    },
    verification_document: {
        type: DataTypes.STRING, // Path to the uploaded document
    },
    legal_name: {
        type: DataTypes.STRING,
    },
    verification_feedback: {
        type: DataTypes.TEXT, // Reason for rejection or feedback
    },
    reset_password_token: {
        type: DataTypes.STRING,
    },
    reset_password_expires: {
        type: DataTypes.DATE,
    },
    is_email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    email_verification_token: {
        type: DataTypes.STRING,
    },
    email_verification_expires: {
        type: DataTypes.DATE,
    },
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

module.exports = User;
