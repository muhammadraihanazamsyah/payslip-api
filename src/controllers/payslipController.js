// src/controllers/payslipController.js
const payslipRepository = require('../repositories/payslipRepository');
const userRepository = require('../repositories/userRepository');
const { logAudit } = require('../utils/auditLogger');

module.exports = {
    async getPayslip(request, reply) {
        const user = request.user;
        if (user.role !== 'employee') {
            return reply.code(401).send({ message: 'Only employees can get payslip' });
        }
        // Ambil payslip terakhir milik user
        const payslips = await payslipRepository.findAllByUser(user.id);
        if (!payslips || payslips.length === 0) {
            return reply.code(404).send({ message: 'No payslip found' });
        }
        // Ambil payslip terbaru
        const payslip = payslips[0];
        return {
            payslip: {
                attendance_days: payslip.attendance_days,
                overtime_hours: payslip.overtime_hours,
                overtime_pay: payslip.overtime_pay,
                reimbursement_total: payslip.reimbursement_total,
                reimbursements: payslip.breakdown?.reimbursements || [],
                breakdown: payslip.breakdown,
                take_home_pay: payslip.take_home_pay
            }
        };
    },
    
    async adminGeneratePayslip(request, reply) {
        const user = request.user;
        if (user.role !== 'admin') {
            return reply.code(401).send({ message: 'Only admin can generate payslip' });
        }
        const { payroll_id } = request.body;
        const payroll = await require('../repositories/payrollRepository').findById(payroll_id);
        if (!payroll) {
            return reply.code(400).send({ message: 'Payroll period not found' });
        }
        if (payroll.processed) {
            return reply.code(400).send({ message: 'Payslip already generated for this period' });
        }
        const employees = await userRepository.findAllEmployees();
        const attendanceRepository = require('../repositories/attendanceRepository');
        const overtimeRepository = require('../repositories/overtimeRepository');
        const reimbursementRepository = require('../repositories/reimbursementRepository');
        const getWorkdays = require('../utils/getWorkdays');
        for (const emp of employees) {
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
            const payslip = await payslipRepository.create({
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
            await logAudit({
                table: 'Payslip',
                record_id: payslip.id,
                action: 'CREATE',
                changes: payslip,
                user_id: user.id,
                ip_address: request.ip,
                request_id: request.id
            });
        }
        payroll.processed = true;
        payroll.processed_at = new Date();
        await payroll.save();
        await logAudit({
            table: 'Payroll',
            record_id: payroll.id,
            action: 'PROCESS',
            changes: payroll,
            user_id: user.id,
            ip_address: request.ip,
            request_id: request.id
        });
        return { message: 'Payslip generated for all employees in this period' };
    },
};
