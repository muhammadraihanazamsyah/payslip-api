// src/utils/auditLogger.js
const auditLogRepository = require('../repositories/auditLogRepository');

async function logAudit({ table, record_id, action, changes, user_id, ip_address, request_id }) {
    await auditLogRepository.create({
        table_name: table,
        record_id,
        action,
        changes,
        user_id,
        ip_address,
        request_id
    });
}

module.exports = { logAudit };
