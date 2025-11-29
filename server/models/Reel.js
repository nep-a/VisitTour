const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Reel = sequelize.define('Reel', {
    video_url: {
        type: DataTypes.STRING(2048),
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    location: {
        type: DataTypes.STRING,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
    },
    category: {
        type: DataTypes.STRING,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    expires_at: {
        type: DataTypes.DATE,
    },
    moderation_status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
    },
    moderation_feedback: {
        type: DataTypes.TEXT,
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    tableName: 'reels',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

Reel.belongsTo(User, { foreignKey: 'host_id' });
User.hasMany(Reel, { foreignKey: 'host_id' });

module.exports = Reel;
