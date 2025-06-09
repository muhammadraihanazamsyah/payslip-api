// src/repositories/payrollRepository.js
const { Payroll } = require('../models');

module.exports = {
    findById: (id) => Payroll.findByPk(id),
    findByPeriod: (start, end) => Payroll.findOne({ where: { period_start: start, period_end: end } }),
    findAll: () => Payroll.findAll({ order: [['period_start', 'DESC']] }),
    create: (data) => Payroll.create(data),
    // ...tambahkan fungsi lain sesuai kebutuhan
};
