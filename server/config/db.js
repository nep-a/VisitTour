const { Sequelize } = require('sequelize');
require('dotenv').config();

// First connect without DB to create it if needed
const initializeDb = async () => {
    const tempSequelize = new Sequelize('', process.env.DB_USER, process.env.DB_PASS, {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
    });

    try {
        await tempSequelize.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
        console.log(`Database ${process.env.DB_NAME} checked/created.`);
    } catch (error) {
        console.error('Error creating database:', error);
    } finally {
        await tempSequelize.close();
    }
};

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
    }
);

// Export a function to ensure DB exists before syncing
sequelize.ensureDbExists = initializeDb;

module.exports = sequelize;
