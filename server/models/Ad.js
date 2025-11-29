const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Ad = sequelize.define('Ad', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    link: {
        type: DataTypes.STRING,
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'ads',
    timestamps: true
});

Ad.belongsTo(User, { foreignKey: 'created_by' });

module.exports = Ad;
