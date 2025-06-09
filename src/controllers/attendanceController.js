// src/controllers/attendanceController.js
const attendanceRepository = require('../repositories/attendanceRepository');
const getWorkdays = require('../utils/getWorkdays');
const { logAudit } = require('../utils/auditLogger');

module.exports = {
    async submitAttendance(request, reply) {
        const user = request.user;
        if (user.role !== 'employee') {
            return reply.code(401).send({ message: 'Only employees can submit attendance' });
        }
        const today = new Date();
        const day = today.getDay();
        if (day === 0 || day === 6) {
            return reply.code(400).send({ message: 'Cannot submit attendance on weekends' });
        }
        const dateStr = today.toISOString().slice(0, 10);
        const exists = await attendanceRepository.findByUserAndDate(user.id, dateStr);
        if (exists) {
            return reply.code(400).send({ message: 'Attendance already submitted for today' });
        }
        const attendance = await attendanceRepository.create({ user_id: user.id, date: dateStr, created_by: user.id, created_ip: request.ip });
        // Audit log
        await logAudit({
            table: 'Attendance',
            record_id: attendance.id,
            action: 'CREATE',
            changes: attendance,
            user_id: user.id,
            ip_address: request.ip,
            request_id: request.id
        });
        return { message: 'Attendance submitted' };
    }
};
