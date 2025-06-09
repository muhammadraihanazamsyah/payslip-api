// src/__tests__/attendance.test.js
const fastify = require('fastify')();
const attendanceRoutes = require('../routes/attendanceRoutes');
const authRoutes = require('../routes/authRoutes');
const { sequelize, User } = require('../models');
const jwt = require('@fastify/jwt');

// Helper: dapatkan JWT token untuk test employee
async function getEmployeeToken(fastify) {
    const username = 'Monty481';
    const password = 'password';
    let user = await User.findOne({ where: { username } });
    if (!user) {
        const bcrypt = require('bcrypt');
        const hash = await bcrypt.hash(password, 10);
        user = await User.create({ username, password: hash, role: 'employee', salary: 5000000 });
    }
    // login route SUDAH terdaftar di beforeAll
    const response = await fastify.inject({
        method: 'POST',
        url: '/login',
        payload: { username, password }
    });
    return JSON.parse(response.body).token;
}


describe('Attendance API', () => {
    beforeAll(async () => {
        await fastify.register(jwt, { secret: 'supersecret' });

        fastify.decorate("authenticate", async function (request, reply) {
            try {
                await request.jwtVerify();
            } catch (err) {
                reply.code(401).send({ message: 'Unauthorized' });
            }
        });
        
        await fastify.register(authRoutes);
        await fastify.register(attendanceRoutes);
        await sequelize.sync();
    });

    afterAll(async () => {
        await fastify.close();
    });

    test('POST /attendance without JWT should fail', async () => {
        const response = await fastify.inject({
            method: 'POST',
            url: '/attendance',
            payload: { user_id: 1, date: '2025-06-09' }
        });
        expect(response.statusCode).toBe(401);
    });

    test('POST /attendance with valid JWT should success', async () => {
        const token = await getEmployeeToken(fastify);
        const today = new Date();
        // pastikan hari kerja
        while (today.getDay() === 0 || today.getDay() === 6) today.setDate(today.getDate() + 1);
        const dateStr = today.toISOString().slice(0, 10);
        const response = await fastify.inject({
            method: 'POST',
            url: '/attendance',
            headers: { Authorization: `Bearer ${token}` },
            payload: { user_id: 1, date: dateStr }
        });
        // 200 (success) atau 400 (sudah absen hari ini)
        expect([200, 400]).toContain(response.statusCode);
    });
});
