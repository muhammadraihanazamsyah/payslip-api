// src/repositories/reimbursementRepository.js
const { Reimbursement } = require('../models');
const { Op } = require('sequelize');

module.exports = {
    findAllByUserAndPeriod: (user_id, start, end) =>
        Reimbursement.findAll({
            where: {
                user_id,
                // Gunakan field tanggal yang benar untuk filter periode
                // Jika ada field date/tanggal pengajuan, gunakan itu. Jika tidak, gunakan created_at
                [Op.and]: [
                    { created_at: { [Op.gte]: start } },
                    { created_at: { [Op.lte]: end } }
                ]
            },
            order: [['created_at', 'ASC']]
        }),
    create: (data) => Reimbursement.create(data),
    // ...tambahkan fungsi lain sesuai kebutuhan
};
