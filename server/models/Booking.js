const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Reel = require('./Reel');

const Booking = sequelize.define('Booking', {
    booking_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    traveler_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    guests: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    special_requests: {
        type: DataTypes.TEXT,
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'pending',
    },
    host_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    deleted_by_traveler: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'bookings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

Booking.belongsTo(User, { as: 'Traveler', foreignKey: 'user_id' });
Booking.belongsTo(User, { as: 'Host', foreignKey: 'host_id' });
Booking.belongsTo(Reel, { foreignKey: 'reel_id' });
User.hasMany(Booking, { foreignKey: 'user_id' });
User.hasMany(Booking, { foreignKey: 'host_id' });
Reel.hasMany(Booking, { foreignKey: 'reel_id' });

module.exports = Booking;
