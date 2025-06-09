// src/__tests__/payslip.test.js
const fastify = require('fastify')();
const jwt = require('@fastify/jwt');
const payslipRoutes = require('../routes/payslipRoutes');
const authRoutes = require('../routes/authRoutes');
const { sequelize, User } = require('../models');
const bcrypt = require('bcrypt');

async function getEmployeeToken() {
    const username = 'Monty481';
    const password = 'password';
    let user = await User.findOne({ where: { username } });
    if (!user) {
        const hash = await bcrypt.hash(password, 10);
        user = await User.create({ username, password: hash, role: 'employee', salary: 5000000 });
    }
    const response = await fastify.inject({
        method: 'POST',
        url: '/login',
        payload: { username, password }
    });
    return JSON.parse(response.body).token;
}

describe('Payslip API', () => {
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
        await fastify.register(payslipRoutes);
        await sequelize.sync();
    });

    afterAll(async () => {
        await fastify.close();
    });

    test('GET /payslip without JWT should fail', async () => {
        const response = await fastify.inject({
            method: 'GET',
            url: '/payslip'
        });
        expect(response.statusCode).toBe(401);
    });

    test('GET /payslip with valid JWT should success', async () => {
        const token = await getEmployeeToken();
        const response = await fastify.inject({
            method: 'GET',
            url: '/payslip',
            headers: { Authorization: `Bearer ${token}` }
        });
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toHaveProperty('payslips');
    });
});