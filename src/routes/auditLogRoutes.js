// src/routes/auditLogRoutes.js
const auditLogController = require('../controllers/auditLogController');
const authenticate = require('../middlewares/authenticate');

async function auditLogRoutes(fastify) {
    fastify.get('/audit-log', {
        preHandler: [authenticate],
        schema: {
            tags: ['AuditLog'],
            summary: 'Get audit logs',
            description: 'Retrieve audit logs (admin only).'
        }
    }, auditLogController.listAuditLogs);
}

module.exports = auditLogRoutes;