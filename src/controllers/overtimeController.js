// src/controllers/overtimeController.js
const overtimeRepository = require('../repositories/overtimeRepository');
const { logAudit } = require('../utils/auditLogger');

module.exports = {
    async submitOvertime(request, reply) {
        const user = request.user;
        if (user.role !== 'employee') {
            return reply.code(401).send({ message: 'Only employees can submit overtime' });
        }
        const { date, hours } = request.body;
        if (hours < 1 || hours > 3) {
            return reply.code(400).send({ message: 'Overtime hours must be between 1 and 3' });
        }
        const today = new Date();
        const overtimeDate = new Date(date);
        if (overtimeDate > today) {
            return reply.code(400).send({ message: 'Cannot submit overtime for future dates' });
        }
        const exists = await overtimeRepository.findByUserAndDate(user.id, date);
        if (exists) {
            return reply.code(400).send({ message: 'Overtime already submitted for this date' });
        }
        const overtime = await overtimeRepository.create({ user_id: user.id, date, hours, created_by: user.id, created_ip: request.ip });
        // Audit log
        await logAudit({
            table: 'Overtime',
            record_id: overtime.id,
            action: 'CREATE',
            changes: overtime,
            user_id: user.id,
            ip_address: request.ip,
            request_id: request.id
        });
        return { message: 'Overtime submitted' };
    }
};
