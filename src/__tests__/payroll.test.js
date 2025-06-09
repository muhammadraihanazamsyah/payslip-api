// src/__tests__/payroll.test.js
const fastify = require('fastify')();
const jwt = require('@fastify/jwt');
const payrollRoutes = require('../routes/payrollRoutes');
const authRoutes = require('../routes/authRoutes');
const { sequelize, User } = require('../models');
const bcrypt = require('bcrypt');

async function getAdminToken() {
    const username = 'admin';
    const password = 'admin123';
    let user = await User.findOne({ where: { username } });
    if (!user) {
        const hash = await bcrypt.hash(password, 10);
        user = await User.create({ username, password: hash, role: 'admin', salary: 10000000 });
    }
    const response = await fastify.inject({
        method: 'POST',
        url: '/login',
        payload: { username, password }
    });
    return JSON.parse(response.body).token;
}

describe('Payroll API', () => {
    beforeAll(async () => {
        await fastify.register(jwt, { secret: 'supersecret' });
        
        fastify.decorate('authenticate', async function (request, reply) {
            try {
                await request.jwtVerify();
            } catch (err) {
                reply.send(err);
            }
        });

        await fastify.register(authRoutes);
        await fastify.register(payrollRoutes);
        await sequelize.sync();
    });

    afterAll(async () => {
        await fastify.close();
    });

    test('POST /payroll/period without JWT should fail', async () => {
        const response = await fastify.inject({
            method: 'POST',
            url: '/payroll/period',
            payload: { period_start: '2025-06-01', period_end: '2025-06-30' }
        });
        expect(response.statusCode).toBe(401);
    });

    test('POST /payroll/period with valid admin JWT should success', async () => {
        const token = await getAdminToken();
        const response = await fastify.inject({
            method: 'POST',
            url: '/payroll/period',
            headers: { Authorization: `Bearer ${token}` },
            payload: { period_start: '2025-06-01', period_end: '2025-06-30' }
        });
        expect([200, 400]).toContain(response.statusCode);
    });
});