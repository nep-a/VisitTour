const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const ActionLog = sequelize.define('ActionLog', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    details: {
        type: DataTypes.TEXT,
    },
    ip_address: {
        type: DataTypes.STRING,
    }
}, {
    tableName: 'action_logs',
    timestamps: true
});

ActionLog.belongsTo(User, { foreignKey: 'user_id' });

module.exports = ActionLog;
