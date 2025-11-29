const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Reel = require('./Reel');
const Booking = require('./Booking');

const Review = sequelize.define('Review', {
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: [10, 500] // Minimum 10 chars, max 500
        }
    },
    host_reply: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'reviews',
    timestamps: true
});

Review.belongsTo(User, { foreignKey: 'user_id' }); // Traveler
Review.belongsTo(Reel, { foreignKey: 'reel_id' });
Review.belongsTo(Booking, { foreignKey: 'booking_id' });

User.hasMany(Review, { foreignKey: 'user_id' });
Reel.hasMany(Review, { foreignKey: 'reel_id' });
Booking.hasOne(Review, { foreignKey: 'booking_id' });

module.exports = Review;
