const bcrypt = require('bcryptjs');
const User = require('./models/User');
const sequelize = require('./config/db');

async function resetAdmin() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Delete existing admins
        const deleted = await User.destroy({
            where: {
                role: 'admin'
            }
        });
        console.log(`Deleted ${deleted} existing admin(s).`);

        // Create new main admin
        const hashedPassword = await bcrypt.hash('ZuruSasa@Travel', 10);

        const newAdmin = await User.create({
            username: 'ZuruSasa',
            email: 'ZuruSasa@gmail.com',
            password_hash: hashedPassword,
            role: 'admin',
            is_email_verified: true,
            profile_picture: null
        });

        console.log('Main Admin created successfully:');
        console.log('Name: ZuruSasa');
        console.log('Email: ZuruSasa@gmail.com');
        console.log('Password: ZuruSasa@Travel');

    } catch (error) {
        console.error('Error resetting admin:', error);
    } finally {
        await sequelize.close();
    }
}

resetAdmin();
