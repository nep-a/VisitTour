const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const TeamMember = sequelize.define('TeamMember', {
    role: {
        type: DataTypes.ENUM('admin', 'editor', 'viewer'),
        defaultValue: 'viewer',
    },
    permissions: {
        type: DataTypes.JSON, // e.g., ['manage_bookings', 'edit_reels']
        defaultValue: [],
    }
}, {
    tableName: 'team_members',
    timestamps: true
});

TeamMember.belongsTo(User, { as: 'Host', foreignKey: 'host_id' });
TeamMember.belongsTo(User, { as: 'Member', foreignKey: 'member_id' });

module.exports = TeamMember;
