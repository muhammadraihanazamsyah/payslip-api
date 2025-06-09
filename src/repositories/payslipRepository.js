// src/repositories/payslipRepository.js
const { Payslip } = require('../models');

module.exports = {
    findByUserAndPayroll: (user_id, payroll_id) => Payslip.findOne({ where: { user_id, payroll_id } }),
    findAllByUser: (user_id) => Payslip.findAll({ where: { user_id }, order: [['created_at', 'DESC']] }),
    findAllByPayroll: (payroll_id) => Payslip.findAll({ where: { payroll_id } }),
    create: (data) => Payslip.create(data),
    findAll: () => Payslip.findAll({ order: [['created_at', 'DESC']] }),
    // ...tambahkan fungsi lain sesuai kebutuhan
};
