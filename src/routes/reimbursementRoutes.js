// src/routes/reimbursementRoutes.js
const reimbursementController = require('../controllers/reimbursementController');
const authenticate = require('../middlewares/authenticate');

async function reimbursementRoutes(fastify) {
    fastify.post('/reimbursement', {
        preHandler: [authenticate],
        schema: {
            tags: ['Reimbursement'],
            summary: 'Submit reimbursement',
            description: 'Submit reimbursement request for logged-in user.',
            body: {
                type: 'object',
                required: ['amount', 'description'],
                properties: {
                    amount: { type: 'integer', minimum: 1, description: 'Amount to be reimbursed' },
                    description: { type: 'string', description: 'Description of reimbursement' }
                },
            },
        }
    }, reimbursementController.submitReimbursement);
}

module.exports = reimbursementRoutes;
