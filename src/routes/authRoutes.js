// src/routes/authRoutes.js
const authController = require('../controllers/authController');

async function authRoutes(fastify) {
    fastify.post('/login', {
        schema: {
            tags: ['Auth'],
            summary: 'User login',
            description: 'Authenticate user and return JWT.',
            body: {
                type: "object",
                required: ["username", "password"],
                properties: {
                    username: { type: "string" },
                    password: { type: "string" },
                },
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        token: { type: "string" },
                        role: { type: "string" },
                    },
                },
                401: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                    },
                },
            },
        }
    }, authController.login);
}

module.exports = authRoutes;
