// src/__tests__/auditlog.test.js
const fastify = require('fastify')();
const auditLogRoutes = require('../routes/auditLogRoutes');
const authRoutes = require('../routes/authRoutes');
const jwt = require('@fastify/jwt');
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

describe('AuditLog API', () => {
    beforeAll(async () => {
        await fastify.register(jwt, { secret: 'supersecret' });  // pastikan JWT tersedia
        await fastify.decorate('authenticate', async function (request, reply) {
            try {
                await request.jwtVerify();
            } catch (err) {
                reply.send(err);
            }
        });
        await fastify.register(authRoutes);
        await fastify.register(auditLogRoutes);
        await sequelize.sync();
    });

    afterAll(async () => {
        await fastify.close();
    });

    test('GET /audit-log without JWT should fail', async () => {
        const response = await fastify.inject({
            method: 'GET',
            url: '/audit-log'
        });
        expect(response.statusCode).toBe(401);
    });

    test('GET /audit-log with valid admin JWT should success', async () => {
        const token = await getAdminToken();
        const response = await fastify.inject({
            method: 'GET',
            url: '/audit-log',
            headers: { Authorization: `Bearer ${token}` }
        });
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toHaveProperty('logs');
    });
});
