// src/routes/payslipRoutes.js
const payslipController = require('../controllers/payslipController');
const authenticate = require('../middlewares/authenticate');

async function payslipRoutes(fastify) {
    // Employee: generate and get their own payslip (breakdown)
    fastify.get('/payslip', {
        preHandler: [authenticate],
        schema: {
            tags: ['Payslip'],
            summary: 'Get payslip breakdown',
            description: 'Get payslip breakdown for logged-in employee (attendance, overtime, reimbursement, take-home pay).'
        }
    }, payslipController.getPayslip);

    // Admin: generate payslip for all employees for a payroll period
    fastify.post('/admin/payslip/generate', {
        preHandler: [authenticate],
        schema: {
            tags: ['Payslip'],
            summary: 'Generate payslip for all employees',
            description: 'Generate payslip for all employees for a specific payroll period (admin only).',
            body: {
                type: 'object',
                required: ['payroll_id'],
                properties: {
                    payroll_id: { type: 'integer', description: 'Payroll period ID' }
                }
            }
        }
    }, payslipController.adminGeneratePayslip);
}

module.exports = payslipRoutes;
