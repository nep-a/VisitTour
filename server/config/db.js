const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// Check if running on Render (or any environment with DATABASE_URL)
if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false // Required for Render's self-signed certificates
            }
        }
    });

    // No-op for ensureDbExists on production/Postgres as the DB is already created
    sequelize.ensureDbExists = async () => {
        console.log('Skipping DB creation check on production/Postgres.');
    };

} else {
    // Local MySQL Configuration
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

    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASS,
        {
            host: process.env.DB_HOST,
            dialect: 'mysql',
            logging: false,
        }
    );

    sequelize.ensureDbExists = initializeDb;
}

module.exports = sequelize;
