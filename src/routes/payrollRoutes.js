// src/routes/payrollRoutes.js
const payrollController = require('../controllers/payrollController');
const authenticate = require('../middlewares/authenticate');

async function payrollRoutes(fastify) {
    fastify.post('/payroll/period', {
        preHandler: [authenticate],
        body: {
            type: 'object',
            required: ['period_start', 'period_end'],
            properties: {
                period_start: { type: 'string', format: 'date', description: 'Start date' },
                period_end: { type: 'string', format: 'date', description: 'End date' }
            },
        },
        response: {
            200: { type: 'object', properties: { message: { type: 'string' }, payroll_id: { type: 'integer' } } },
            400: { type: 'object', properties: { message: { type: 'string' } } },
            401: { type: 'object', properties: { message: { type: 'string' } } },
        },
        schema: {
            tags: ['Payroll'],
            summary: 'Create payroll period',
            description: 'Create a new payroll period.',
            body: {
                type: 'object',
                required: ['period_start', 'period_end'],
                properties: {
                    period_start: { type: 'string', format: 'date', description: 'Start date' },
                    period_end: { type: 'string', format: 'date', description: 'End date' }
                },
            }
        }
    }, payrollController.addPeriod);

    fastify.post('/payroll/run', {
        preHandler: [authenticate],
        body: {
            type: 'object',
            required: ['payroll_id'],
            properties: {
                payroll_id: { type: 'integer', description: 'Payroll period ID' }
            },
        },
        response: {
            200: { type: 'object', properties: { message: { type: 'string' } } },
            400: { type: 'object', properties: { message: { type: 'string' } } },
            401: { type: 'object', properties: { message: { type: 'string' } } },
        },
        schema: {
            tags: ['Payroll'],
            summary: 'Run payroll',
            description: 'Run payroll for the specified period.',
            body: {
                type: 'object',
                required: ['payroll_id'],
                properties: {
                    payroll_id: { type: 'integer', description: 'Payroll period ID' }
                },
            }
        }
    }, payrollController.runPayroll);

    fastify.get('/payroll/:payroll_id/summary', {
        preHandler: [authenticate],
        schema: {
            tags: ['Payroll'],
            summary: 'Get payroll summary',
            description: 'Retrieve payroll summary for a specific payroll period.'
        }
    }, payrollController.summary);

    fastify.get('/payroll/summary/all', {
        preHandler: [authenticate],
        schema: {
            tags: ['Payroll'],
            summary: 'Get all payroll summaries',
            description: 'Retrieve summaries for all payroll periods.'
        }
    }, payrollController.summaryAll);
}

module.exports = payrollRoutes;
