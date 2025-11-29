const bcrypt = require('bcryptjs');
const sequelize = require('./config/db');
const User = require('./models/User');

const createAdmin = async () => {
    try {
        await sequelize.sync();

        const hashedPassword = await bcrypt.hash('Horace25!', 10);

        const user = await User.create({
            username: 'Musalakani Witaba',
            email: 'melionHorace@gmail.com',
            password_hash: hashedPassword,
            role: 'admin',
            is_email_verified: true
        });

        console.log('Main Admin created:', user.username);
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await sequelize.close();
    }
};

createAdmin();
