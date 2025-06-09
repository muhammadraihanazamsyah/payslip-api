// src/routes/overtimeRoutes.js
const overtimeController = require('../controllers/overtimeController');
const authenticate = require('../middlewares/authenticate');


async function overtimeRoutes(fastify) {
    fastify.post('/overtime', {
        preHandler: [authenticate],
        schema: {
            tags: ['Overtime'],
            summary: 'Submit overtime',
            body: {
                type: 'object',
                required: ['date', 'hours'],
                properties: {
                    date: { type: 'string', format: 'date' },
                    hours: { type: 'number' },
                }
            },
            description: 'Submit overtime request for logged-in user.'
        }
    }, overtimeController.submitOvertime);
}

module.exports = overtimeRoutes;
