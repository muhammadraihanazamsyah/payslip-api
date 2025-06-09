// src/routes/attendanceRoutes.js
const attendanceController = require('../controllers/attendanceController');
const authenticate = require('../middlewares/authenticate');

async function attendanceRoutes(fastify) {
    fastify.post('/attendance', {
        preHandler: [authenticate],
        schema: {
            tags: ['Attendance'],
            summary: 'Submit attendance',
            description: 'Submit daily attendance for logged-in user.'
        }
    }, attendanceController.submitAttendance);
}

module.exports = attendanceRoutes;
