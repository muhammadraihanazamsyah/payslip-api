// src/controllers/authController.js
const { User } = require('../models');
const bcrypt = require('bcrypt');

module.exports = {
    async login(request, reply) {
        const { username, password } = request.body;
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return reply.code(401).send({ message: 'Invalid username or password' });
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return reply.code(401).send({ message: 'Invalid username or password' });
        }
        // Fix: Use reply.jwtSign for Fastify v4+ compatibility
        const token = await reply.jwtSign({ id: user.id, username: user.username, role: user.role });
        return { token, role: user.role };
    }
};
