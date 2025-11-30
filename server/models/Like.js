const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Reel = require('./Reel');

const Like = sequelize.define('Like', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
}, {
    tableName: 'likes',
    timestamps: true,
    updatedAt: false
});

Like.belongsTo(User, { foreignKey: 'user_id' });
Like.belongsTo(Reel, { foreignKey: 'reel_id' });
User.hasMany(Like, { foreignKey: 'user_id' });
Reel.hasMany(Like, { foreignKey: 'reel_id' });

module.exports = Like;
