// src/repositories/overtimeRepository.js
const { Overtime } = require('../models');

module.exports = {
    findByUserAndDate: (user_id, date) => Overtime.findOne({ where: { user_id, date } }),
    findAllByUserAndPeriod: (user_id, start, end) => Overtime.findAll({ where: { user_id, date: { $between: [start, end] } } }),
    create: (data) => Overtime.create(data),
    // ...tambahkan fungsi lain sesuai kebutuhan
};
