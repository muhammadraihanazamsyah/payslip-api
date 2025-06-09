// src/repositories/attendanceRepository.js
const { Attendance } = require('../models');

module.exports = {
    findByUserAndDate: (user_id, date) => Attendance.findOne({ where: { user_id, date } }),
    countByUserAndPeriod: (user_id, start, end) => Attendance.count({ where: { user_id, date: { $between: [start, end] } } }),
    create: (data) => Attendance.create(data),
    // ...tambahkan fungsi lain sesuai kebutuhan
};
