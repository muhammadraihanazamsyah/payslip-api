// src/controllers/reimbursementController.js
const payrollRepository = require('../repositories/payrollRepository');
const userRepository = require('../repositories/userRepository');
const attendanceRepository = require('../repositories/attendanceRepository');
const overtimeRepository = require('../repositories/overtimeRepository');
const reimbursementRepository = require('../repositories/reimbursementRepository');
const payslipRepository = require('../repositories/payslipRepository');
const getWorkdays = require('../utils/getWorkdays');
const { logAudit } = require('../utils/auditLogger');

module.exports = {
    async submitReimbursement(request, reply) {
        const user = request.user;
        if (user.role !== 'employee') {
            return reply.code(401).send({ message: 'Only employees can submit reimbursement' });
        }
        const { amount, description } = request.body;
        if (!amount || amount < 1) {
            return reply.code(400).send({ message: 'Amount must be greater than 0' });
        }
        const reimbursement = await reimbursementRepository.create({ user_id: user.id, amount, description, created_by: user.id, created_ip: request.ip });
        await logAudit({
            table: 'Reimbursement',
            record_id: reimbursement.id,
            action: 'CREATE',
            changes: reimbursement,
            user_id: user.id,
            ip_address: request.ip,
            request_id: request.id
        });
        return { message: 'Reimbursement submitted' };
    },

    // Admin generate payslip untuk multiple/single/all employee
    // async adminGeneratePayslip(request, reply) {
    //     const user = request.user;
    //     if (user.role !== 'admin') {
    //         return reply.code(401).send({ message: 'Only admin can generate payslip' });
    //     }
    //     const { payroll_id, user_ids } = request.body;
    //     const payroll = await payrollRepository.findById(payroll_id);
    //     if (!payroll) {
    //         return reply.code(400).send({ message: 'Payroll period not found' });
    //     }
    //     if (!payroll.processed) {
    //         return reply.code(400).send({ message: 'Payroll must be processed first' });
    //     }
    //     let employees;
    //     if (Array.isArray(user_ids) && user_ids.length > 0) {
    //         employees = await userRepository.findAllEmployees();
    //         employees = employees.filter(e => user_ids.includes(e.id));
    //     } else {
    //         employees = await userRepository.findAllEmployees();
    //     }
    //     let generated = 0;
    //     for (const emp of employees) {
    //         const exists = await payslipRepository.findByUserAndPayroll(emp.id, payroll_id);
    //         if (exists) continue;
    //         const attendance = await attendanceRepository.countByUserAndPeriod(emp.id, payroll.period_start, payroll.period_end);
    //         const overtimeRows = await overtimeRepository.findAllByUserAndPeriod(emp.id, payroll.period_start, payroll.period_end);
    //         const overtime_hours = overtimeRows.reduce((sum, row) => sum + row.hours, 0);
    //         const reimbursements = await reimbursementRepository.findAllByUserAndPeriod(emp.id, payroll.period_start, payroll.period_end);
    //         const reimbursement_total = reimbursements.reduce((sum, row) => sum + row.amount, 0);
    //         const total_workdays = getWorkdays(payroll.period_start, payroll.period_end);
    //         const prorated_salary = Math.round(emp.salary * (attendance / total_workdays));
    //         const overtime_pay = Math.round((emp.salary / total_workdays / 8) * overtime_hours * 2);
    //         const take_home_pay = prorated_salary + overtime_pay + reimbursement_total;
    //         const breakdown = {
    //             attendance_days: attendance,
    //             total_workdays,
    //             prorated_salary,
    //             overtime_hours,
    //             overtime_pay,
    //             reimbursement_total,
    //             take_home_pay,
    //             reimbursements: reimbursements.map(r => ({ amount: r.amount, description: r.description }))
    //         };
    //         await payslipRepository.create({
    //             user_id: emp.id,
    //             payroll_id: payroll.id,
    //             attendance_days: attendance,
    //             overtime_hours,
    //             overtime_pay,
    //             reimbursement_total,
    //             take_home_pay,
    //             breakdown,
    //             created_by: user.id,
    //             created_ip: request.ip
    //         });
    //         generated++;
    //     }
    //     return { message: `Payslip generated for ${generated} employee(s)` };
    // }
};
