// src/__tests__/auth.test.js
const fastify = require('fastify')();
const authRoutes = require('../routes/authRoutes');
const { sequelize, User } = require('../models');
const jwt = require('@fastify/jwt');

// Helper: create test user if not exists
async function ensureTestUser() {
    const username = 'Mae772';
    const password = 'password';
    let user = await User.findOne({ where: { username } });
    if (!user) {
        const bcrypt = require('bcrypt');
        const hash = await bcrypt.hash(password, 10);
        user = await User.create({ username, password: hash, role: 'employee', salary: 5000000 });
    }
    return { username, password };
}

describe('Auth API', () => {
    beforeAll(async () => {
         await fastify.register(jwt, { secret: 'supersecret' });
        await fastify.register(authRoutes);
        await sequelize.sync();
        await ensureTestUser();
    });

    afterAll(async () => {
        await fastify.close();
    });

    test('POST /login with invalid credentials', async () => {
        const response = await fastify.inject({
            method: 'POST',
            url: '/login',
            payload: { username: 'wrong', password: 'wrong' }
        });
        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.body).message).toBe('Invalid username or password');
    });

    test('POST /login with valid credentials', async () => {
        const { username, password } = await ensureTestUser();
        const response = await fastify.inject({
            method: 'POST',
            url: '/login',
            payload: { username, password }
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('token');
        expect(body).toHaveProperty('role');
    });
});
