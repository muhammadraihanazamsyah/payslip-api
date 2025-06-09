// src/controllers/payrollController.js
const payrollRepository = require('../repositories/payrollRepository');
const userRepository = require('../repositories/userRepository');
const attendanceRepository = require('../repositories/attendanceRepository');
const overtimeRepository = require('../repositories/overtimeRepository');
const reimbursementRepository = require('../repositories/reimbursementRepository');
const payslipRepository = require('../repositories/payslipRepository');
const getWorkdays = require('../utils/getWorkdays');
const { logAudit } = require('../utils/auditLogger');

module.exports = {
    async addPeriod(request, reply) {
        const user = request.user;
        if (user.role !== 'admin') {
            return reply.code(401).send({ message: 'Only admin can add payroll period' });
        }
        const { period_start, period_end } = request.body;
        if (new Date(period_end) < new Date(period_start)) {
            return reply.code(400).send({ message: 'End date must be after start date' });
        }
        const exists = await payrollRepository.findByPeriod(period_start, period_end);
        if (exists) {
            return reply.code(400).send({ message: 'Payroll period already exists' });
        }
        const payroll = await payrollRepository.create({ period_start, period_end, created_by: user.id, created_ip: request.ip });
        return { message: 'Payroll period created', payroll_id: payroll.id };
    },

    async runPayroll(request, reply) {
        const user = request.user;
        if (user.role !== 'admin') {
            return reply.code(401).send({ message: 'Only admin can run payroll' });
        }
        const { payroll_id } = request.body;
        const payroll = await payrollRepository.findById(payroll_id);
        if (!payroll) {
            return reply.code(400).send({ message: 'Payroll period not found' });
        }
        if (payroll.processed) {
            return reply.code(400).send({ message: 'Payroll already processed for this period' });
        }
        // Lock data: ambil snapshot data saat payroll dijalankan
        const employees = await userRepository.findAllEmployees();
        for (const emp of employees) {
            // Ambil data absensi, lembur, reimbursement hanya untuk periode ini
            const attendance = await attendanceRepository.countByUserAndPeriod(emp.id, payroll.period_start, payroll.period_end);
            const overtimeRows = await overtimeRepository.findAllByUserAndPeriod(emp.id, payroll.period_start, payroll.period_end);
            const overtime_hours = overtimeRows.reduce((sum, row) => sum + row.hours, 0);
            const reimbursements = await reimbursementRepository.findAllByUserAndPeriod(emp.id, payroll.period_start, payroll.period_end);
            const reimbursement_total = reimbursements.reduce((sum, row) => sum + row.amount, 0);
            const total_workdays = getWorkdays(payroll.period_start, payroll.period_end);
            const prorated_salary = Math.round(emp.salary * (attendance / total_workdays));
            const overtime_pay = Math.round((emp.salary / total_workdays / 8) * overtime_hours * 2);
            const take_home_pay = prorated_salary + overtime_pay + reimbursement_total;
            const breakdown = {
                attendance_days: attendance,
                total_workdays,
                prorated_salary,
                overtime_hours,
                overtime_pay,
                reimbursement_total,
                take_home_pay,
                reimbursements: reimbursements.map(r => ({ amount: r.amount, description: r.description }))
            };
            await payslipRepository.create({
                user_id: emp.id,
                payroll_id: payroll.id,
                attendance_days: attendance,
                overtime_hours,
                overtime_pay,
                reimbursement_total,
                take_home_pay,
                breakdown,
                created_by: user.id,
                created_ip: request.ip
            });
        }
        // Setelah payroll diproses, set processed agar tidak bisa diulang
        payroll.processed = true;
        payroll.processed_at = new Date();
        await payroll.save();
        // Audit log
        await logAudit({
            table: 'Payroll',
            record_id: payroll.id,
            action: 'PROCESS',
            changes: { payroll_id: payroll.id, processed: true },
            user_id: user.id,
            ip_address: request.ip,
            request_id: request.id
        });
        return { message: 'Payroll processed and locked for this period' };
    },

    async summary(request, reply) {
        const user = request.user;
        if (user.role !== 'admin') {
            return reply.code(401).send({ message: 'Only admin can get payroll summary' });
        }
        const { payroll_id } = request.params;
        const payslips = await payslipRepository.findAllByPayroll(payroll_id);
        // join ke userRepository jika ingin username
        const users = await userRepository.findAllEmployees();
        const userMap = Object.fromEntries(users.map(u => [u.id, u.username]));
        const summary = payslips.map(p => ({
            user_id: p.user_id,
            username: userMap[p.user_id],
            take_home_pay: p.take_home_pay
        }));
        const total_take_home_pay = summary.reduce((sum, p) => sum + p.take_home_pay, 0);
        return { summary, total_take_home_pay };
    },

    // Summary all employee payslip (all periods)
    async summaryAll(request, reply) {
        const user = request.user;
        if (user.role !== 'admin') {
            return reply.code(401).send({ message: 'Only admin can get payroll summary' });
        }
        const payslips = await payslipRepository.findAll();
        const users = await userRepository.findAllEmployees();
        const userMap = Object.fromEntries(users.map(u => [u.id, u.username]));
        const summaryMap = {};
        for (const p of payslips) {
            if (!summaryMap[p.user_id]) {
                summaryMap[p.user_id] = {
                    user_id: p.user_id,
                    username: userMap[p.user_id],
                    total_take_home_pay: 0
                };
            }
            summaryMap[p.user_id].total_take_home_pay += p.take_home_pay;
        }
        const summary = Object.values(summaryMap);
        const total_take_home_pay = summary.reduce((sum, p) => sum + p.total_take_home_pay, 0);
        return { summary, total_take_home_pay };
    }
};
