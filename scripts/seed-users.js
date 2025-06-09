const { User } = require('../src/models');
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');

async function seed() {
    // 1 admin
    await User.create({
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        salary: 0,
        role: 'admin',
    });

    // 100 employees
    for (let i = 0; i < 100; i++) {
        await User.create({
            username: faker.internet.username() + i,
            password: await bcrypt.hash('password', 10),
            salary: faker.number.int({ min: 3000000, max: 15000000 }),
            role: 'employee',
        });
    }

    console.log('✅ Seed complete');
}

seed().then(() => process.exit(0));
