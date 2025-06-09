// src/controllers/auditLogController.js
const auditLogRepository = require('../repositories/auditLogRepository');

module.exports = {
    async listAuditLogs(request, reply) {
        const user = request.user;
        if (user.role !== 'admin') {
            return reply.code(401).send({ message: 'Only admin can list audit logs' });
        }
        // Simple: list all audit logs (bisa ditambah filter jika perlu)
        const logs = await auditLogRepository.findAll ? await auditLogRepository.findAll() : [];
        return { logs };
    },
};
