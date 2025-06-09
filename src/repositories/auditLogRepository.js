// src/repositories/auditLogRepository.js
const { AuditLog } = require('../models');

module.exports = {
  create: (data) => AuditLog.create(data),
  findAll: () => AuditLog.findAll({ order: [['created_at', 'DESC']] }),
  // ...tambahkan fungsi lain sesuai kebutuhan
};
