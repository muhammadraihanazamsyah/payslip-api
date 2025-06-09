// src/repositories/userRepository.js
const { User } = require('../models');

module.exports = {
    findById: (id) => User.findByPk(id),
    findByUsername: (username) => User.findOne({ where: { username } }),
    findAllEmployees: () => User.findAll({ where: { role: 'employee' } }),
    // ...tambahkan fungsi lain sesuai kebutuhan
};
