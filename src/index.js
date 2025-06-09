// require("dotenv").config();
// const fastify = require("fastify")({ logger: true });
// const { sequelize } = require("./models");

// const fastifyCors = require("@fastify/cors");

// async function registerPlugins() {
//     await fastify.register(fastifyCors, {
//         origin: true,
//     });

//     await fastify.register(require("@fastify/jwt"), {
//         secret: process.env.JWT_SECRET || "supersecret",
//     });

//     await fastify.register(require("@fastify/swagger"), {
//         swagger: {
//             info: { title: "Payslip API", version: "1.0.0" },
//             securityDefinitions: {
//                 bearerAuth: {
//                     type: "apiKey",
//                     name: "Authorization",
//                     in: "header",
//                     description: "Enter JWT token like: Bearer <token>"
//                 }
//             },
//             security: [{ bearerAuth: [] }], // ini bikin semua endpoint butuh bearerAuth secara default, bisa override di route schema
//         },
//     });


//     await fastify.register(require("@fastify/swagger-ui"), {
//         routePrefix: "/docs",
//         uiConfig: {
//             docExpansion: 'list',
//             deepLinking: false,
//         },
//         staticCSP: true,
//         transformStaticCSP: (header) => header,
//         exposeRoute: true,
//     });

//     await fastify.register(require("fastify-request-id"));
// }

// // Daftarkan route setelah plugins sudah di-register
// async function registerRoutes() {
//     fastify.get("/health", {
//         schema: {
//             summary: "Health check",
//             description: "Returns OK status to verify server health",
//             tags: ["Health"],
//             response: {
//                 200: {
//                     type: "object",
//                     properties: {
//                         status: { type: "string" },
//                     },
//                 },
//             },
//         },
//     }, async () => ({ status: "ok" }));

//     fastify.post('/login', {
//         schema: {
//             summary: "User login",
//             description: "Authenticate user and return JWT token",
//             tags: ["Auth"],
//             body: {
//                 type: "object",
//                 required: ["username", "password"],
//                 properties: {
//                     username: { type: "string" },
//                     password: { type: "string" },
//                 },
//             },
//             response: {
//                 200: {
//                     type: "object",
//                     properties: {
//                         token: { type: "string" },
//                         role: { type: "string" },
//                     },
//                 },
//                 401: {
//                     type: "object",
//                     properties: {
//                         message: { type: "string" },
//                     },
//                 },
//             },
//         }
//     }, async (request, reply) => {
//         const { username, password } = request.body;
//         const { User } = require('./models');
//         const user = await User.findOne({ where: { username } });
//         if (!user) {
//             return reply.code(401).send({ message: 'Invalid username or password' });
//         }
//         const bcrypt = require('bcrypt');
//         const valid = await bcrypt.compare(password, user.password);
//         if (!valid) {
//             return reply.code(401).send({ message: 'Invalid username or password' });
//         }
//         const token = fastify.jwt.sign({ id: user.id, username: user.username, role: user.role });
//         return { token, role: user.role };
//     });

//     // Middleware untuk autentikasi JWT
//     fastify.decorate('authenticate', async function (request, reply) {
//         try {
//             await request.jwtVerify();
//         } catch (err) {
//             return reply.code(401).send({ message: 'Unauthorized' });
//         }
//     });

//     // Endpoint submit attendance (employee only)
//     fastify.post('/attendance', {
//         preHandler: [fastify.authenticate],
//         schema: {
//             summary: 'Submit attendance',
//             description: 'Employee submits attendance for today',
//             tags: ['Attendance'],
//             security: [{ bearerAuth: [] }], // require JWT token
//             body: {
//                 type: 'object',
//                 required: ["user_id", "date"],
//                 properties: {
//                     user_id: { type: 'integer', description: 'ID of the user submitting attendance' },
//                     date: { type: 'string', format: 'date', description: 'Date of attendance submission' }
//                 },
//             },
//             response: {
//                 200: { type: 'object', properties: { message: { type: 'string' } } },
//                 400: { type: 'object', properties: { message: { type: 'string' } } },
//                 401: { type: 'object', properties: { message: { type: 'string' } } },
//             },
//         }
//     }, async (request, reply) => {
//         const { Attendance } = require('./models');
//         const user = request.user;
//         if (user.role !== 'employee') {
//             return reply.code(401).send({ message: 'Only employees can submit attendance' });
//         }
//         const today = new Date();
//         const day = today.getDay();
//         if (day === 0 || day === 6) {
//             return reply.code(400).send({ message: 'Cannot submit attendance on weekends' });
//         }
//         const dateStr = today.toISOString().slice(0, 10);
//         const exists = await Attendance.findOne({ where: { user_id: user.id, date: dateStr } });
//         if (exists) {
//             return reply.code(400).send({ message: 'Attendance already submitted for today' });
//         }
//         await Attendance.create({ user_id: user.id, date: dateStr, created_by: user.id, created_ip: request.ip });
//         return { message: 'Attendance submitted' };
//     });

//     // Endpoint submit overtime (employee only)
//     fastify.post('/overtime', {
//         preHandler: [fastify.authenticate],
//         schema: {
//             summary: 'Submit overtime',
//             description: 'Employee submits overtime for a date',
//             tags: ['Overtime'],
//             security: [{ bearerAuth: [] }],
//             body: {
//                 type: 'object',
//                 required: ['date', 'hours'],
//                 properties: {
//                     date: { type: 'string', format: 'date', description: 'Date of overtime' },
//                     hours: { type: 'integer', minimum: 1, maximum: 3, description: 'Number of overtime hours (max 3)' }
//                 },
//             },
//             response: {
//                 200: { type: 'object', properties: { message: { type: 'string' } } },
//                 400: { type: 'object', properties: { message: { type: 'string' } } },
//                 401: { type: 'object', properties: { message: { type: 'string' } } },
//             },
//         }
//     }, async (request, reply) => {
//         const { Overtime } = require('./models');
//         const user = request.user;
//         if (user.role !== 'employee') {
//             return reply.code(401).send({ message: 'Only employees can submit overtime' });
//         }
//         const { date, hours } = request.body;
//         if (hours < 1 || hours > 3) {
//             return reply.code(400).send({ message: 'Overtime hours must be between 1 and 3' });
//         }
//         const today = new Date();
//         const overtimeDate = new Date(date);
//         if (overtimeDate > today) {
//             return reply.code(400).send({ message: 'Cannot submit overtime for future dates' });
//         }
//         // Only after work (assume after 17:00, but for API just check date <= today)
//         const exists = await Overtime.findOne({ where: { user_id: user.id, date } });
//         if (exists) {
//             return reply.code(400).send({ message: 'Overtime already submitted for this date' });
//         }
//         await Overtime.create({ user_id: user.id, date, hours, created_by: user.id, created_ip: request.ip });
//         return { message: 'Overtime submitted' };
//     });

//     // Endpoint submit reimbursement (employee only)
//     fastify.post('/reimbursement', {
//         preHandler: [fastify.authenticate],
//         schema: {
//             summary: 'Submit reimbursement',
//             description: 'Employee submits reimbursement request',
//             tags: ['Reimbursement'],
//             security: [{ bearerAuth: [] }],
//             body: {
//                 type: 'object',
//                 required: ['amount', 'description'],
//                 properties: {
//                     amount: { type: 'integer', minimum: 1, description: 'Amount to be reimbursed' },
//                     description: { type: 'string', description: 'Description of reimbursement' }
//                 },
//             },
//             response: {
//                 200: { type: 'object', properties: { message: { type: 'string' } } },
//                 400: { type: 'object', properties: { message: { type: 'string' } } },
//                 401: { type: 'object', properties: { message: { type: 'string' } } },
//             },
//         }
//     }, async (request, reply) => {
//         const { Reimbursement } = require('./models');
//         const user = request.user;
//         if (user.role !== 'employee') {
//             return reply.code(401).send({ message: 'Only employees can submit reimbursement' });
//         }
//         const { amount, description } = request.body;
//         if (amount < 1) {
//             return reply.code(400).send({ message: 'Amount must be greater than 0' });
//         }
//         await Reimbursement.create({ user_id: user.id, amount, description, created_by: user.id, created_ip: request.ip });
//         return { message: 'Reimbursement submitted' };
//     });

//     // Endpoint admin: add attendance period (payroll)
//     fastify.post('/payroll/period', {
//         preHandler: [fastify.authenticate],
//         schema: {
//             summary: 'Add payroll attendance period',
//             description: 'Admin adds attendance period for payroll',
//             tags: ['Payroll'],
//             security: [{ bearerAuth: [] }],
//             body: {
//                 type: 'object',
//                 required: ['period_start', 'period_end'],
//                 properties: {
//                     period_start: { type: 'string', format: 'date', description: 'Start date' },
//                     period_end: { type: 'string', format: 'date', description: 'End date' }
//                 },
//             },
//             response: {
//                 200: { type: 'object', properties: { message: { type: 'string' }, payroll_id: { type: 'integer' } } },
//                 400: { type: 'object', properties: { message: { type: 'string' } } },
//                 401: { type: 'object', properties: { message: { type: 'string' } } },
//             },
//         }
//     }, async (request, reply) => {
//         const { Payroll } = require('./models');
//         const user = request.user;
//         if (user.role !== 'admin') {
//             return reply.code(401).send({ message: 'Only admin can add payroll period' });
//         }
//         const { period_start, period_end } = request.body;
//         if (new Date(period_end) < new Date(period_start)) {
//             return reply.code(400).send({ message: 'End date must be after start date' });
//         }
//         // Prevent duplicate period
//         const exists = await Payroll.findOne({ where: { period_start, period_end } });
//         if (exists) {
//             return reply.code(400).send({ message: 'Payroll period already exists' });
//         }
//         const payroll = await Payroll.create({ period_start, period_end, created_by: user.id, created_ip: request.ip });
//         return { message: 'Payroll period created', payroll_id: payroll.id };
//     });

//     // Endpoint admin: run payroll (process payments)
//     fastify.post('/payroll/run', {
//         preHandler: [fastify.authenticate],
//         schema: {
//             summary: 'Run payroll',
//             description: 'Admin runs payroll for a period',
//             tags: ['Payroll'],
//             security: [{ bearerAuth: [] }],
//             body: {
//                 type: 'object',
//                 required: ['payroll_id'],
//                 properties: {
//                     payroll_id: { type: 'integer', description: 'Payroll period ID' }
//                 },
//             },
//             response: {
//                 200: { type: 'object', properties: { message: { type: 'string' } } },
//                 400: { type: 'object', properties: { message: { type: 'string' } } },
//                 401: { type: 'object', properties: { message: { type: 'string' } } },
//             },
//         }
//     }, async (request, reply) => {
//         const { Payroll, User, Attendance, Overtime, Reimbursement, Payslip } = require('./models');
//         const user = request.user;
//         if (user.role !== 'admin') {
//             return reply.code(401).send({ message: 'Only admin can run payroll' });
//         }
//         const { payroll_id } = request.body;
//         const payroll = await Payroll.findByPk(payroll_id);
//         if (!payroll) {
//             return reply.code(400).send({ message: 'Payroll period not found' });
//         }
//         if (payroll.processed) {
//             return reply.code(400).send({ message: 'Payroll already processed for this period' });
//         }
//         // Get all employees
//         const employees = await User.findAll({ where: { role: 'employee' } });
//         for (const emp of employees) {
//             // Attendance days in period
//             const attendance = await Attendance.count({
//                 where: {
//                     user_id: emp.id,
//                     date: { $between: [payroll.period_start, payroll.period_end] }
//                 }
//             });
//             // Overtime in period
//             const overtimeRows = await Overtime.findAll({
//                 where: {
//                     user_id: emp.id,
//                     date: { $between: [payroll.period_start, payroll.period_end] }
//                 }
//             });
//             const overtime_hours = overtimeRows.reduce((sum, row) => sum + row.hours, 0);
//             // Reimbursement in period
//             const reimbursements = await Reimbursement.findAll({
//                 where: {
//                     user_id: emp.id,
//                     created_at: { $between: [payroll.period_start, payroll.period_end] }
//                 }
//             });
//             const reimbursement_total = reimbursements.reduce((sum, row) => sum + row.amount, 0);
//             // Salary calculation
//             const total_workdays = getWorkdays(payroll.period_start, payroll.period_end);
//             const prorated_salary = Math.round(emp.salary * (attendance / total_workdays));
//             const overtime_pay = Math.round((emp.salary / total_workdays / 8) * overtime_hours * 2);
//             const take_home_pay = prorated_salary + overtime_pay + reimbursement_total;
//             // Payslip breakdown
//             const breakdown = {
//                 attendance_days: attendance,
//                 total_workdays,
//                 prorated_salary,
//                 overtime_hours,
//                 overtime_pay,
//                 reimbursement_total,
//                 take_home_pay,
//                 reimbursements: reimbursements.map(r => ({ amount: r.amount, description: r.description }))
//             };
//             await Payslip.create({
//                 user_id: emp.id,
//                 payroll_id: payroll.id,
//                 attendance_days: attendance,
//                 overtime_hours,
//                 overtime_pay,
//                 reimbursement_total,
//                 take_home_pay,
//                 breakdown,
//                 created_by: user.id,
//                 created_ip: request.ip
//             });
//         }
//         payroll.processed = true;
//         payroll.processed_at = new Date();
//         await payroll.save();
//         return { message: 'Payroll processed' };
//     });

    // Endpoint: employee generate payslip (for a payroll period)
    // fastify.get('/payslip/:payroll_id', {
    //     preHandler: [fastify.authenticate],
    //     schema: {
    //         summary: 'Generate payslip',
    //         description: 'Employee generates payslip for a payroll period',
    //         tags: ['Payslip'],
    //         security: [{ bearerAuth: [] }],
    //         params: {
    //             type: 'object',
    //             properties: {
    //                 payroll_id: { type: 'integer', description: 'Payroll period ID' }
    //             },
    //             required: ['payroll_id']
    //         },
    //         response: {
    //             200: {
    //                 type: 'object',
    //                 properties: {
    //                     payslip: { type: 'object' }
    //                 }
    //             },
    //             404: { type: 'object', properties: { message: { type: 'string' } } },
    //             401: { type: 'object', properties: { message: { type: 'string' } } },
    //         },
    //     }
    // }, async (request, reply) => {
    //     const { Payslip } = require('./models');
    //     const user = request.user;
    //     if (user.role !== 'employee') {
    //         return reply.code(401).send({ message: 'Only employees can generate payslip' });
    //     }
    //     const { payroll_id } = request.params;
    //     const payslip = await Payslip.findOne({ where: { user_id: user.id, payroll_id } });
    //     if (!payslip) {
    //         return reply.code(404).send({ message: 'Payslip not found for this period' });
    //     }
    //     return { payslip };
    // });

//     // Endpoint: admin summary of all employee payslips for a payroll period
//     // fastify.get('/payroll/:payroll_id/summary', {
//     //     preHandler: [fastify.authenticate],
//     //     schema: {
//     //         summary: 'Payroll summary',
//     //         description: 'Admin gets summary of all employee payslips for a payroll period',
//     //         tags: ['Payroll'],
//     //         security: [{ bearerAuth: [] }],
//     //         params: {
//     //             type: 'object',
//     //             properties: {
//     //                 payroll_id: { type: 'integer', description: 'Payroll period ID' }
//     //             },
//     //             required: ['payroll_id']
//     //         },
//     //         response: {
//     //             200: {
//     //                 type: 'object',
//     //                 properties: {
//     //                     summary: { type: 'array', items: { type: 'object' } },
//     //                     total_take_home_pay: { type: 'integer' }
//     //                 }
//     //             },
//     //             401: { type: 'object', properties: { message: { type: 'string' } } },
//     //         },
//     //     }
//     // }, async (request, reply) => {
//     //     const { Payslip, User } = require('./models');
//     //     const user = request.user;
//     //     if (user.role !== 'admin') {
//     //         return reply.code(401).send({ message: 'Only admin can get payroll summary' });
//     //     }
//     //     const { payroll_id } = request.params;
//     //     const payslips = await Payslip.findAll({ where: { payroll_id }, include: [{ model: User, attributes: ['username'] }] });
//     //     const summary = payslips.map(p => ({
//     //         user_id: p.user_id,
//     //         username: p.User ? p.User.username : undefined,
//     //         take_home_pay: p.take_home_pay
//     //     }));
//     //     const total_take_home_pay = summary.reduce((sum, p) => sum + p.take_home_pay, 0);
//     //     return { summary, total_take_home_pay };
//     // });

//     // Endpoint: employee list all payslips
//     // fastify.get('/payslip', {
//     //     preHandler: [fastify.authenticate],
//     //     schema: {
//     //         summary: 'List all payslips',
//     //         description: 'Employee lists all payslips',
//     //         tags: ['Payslip'],
//     //         security: [{ bearerAuth: [] }],
//     //         response: {
//     //             200: {
//     //                 type: 'object',
//     //                 properties: {
//     //                     payslips: { type: 'array', items: { type: 'object' } }
//     //                 }
//     //             },
//     //             401: { type: 'object', properties: { message: { type: 'string' } } },
//     //         },
//     //     }
//     // }, async (request, reply) => {
//     //     const { Payslip, Payroll } = require('./models');
//     //     const user = request.user;
//     //     if (user.role !== 'employee') {
//     //         return reply.code(401).send({ message: 'Only employees can list payslips' });
//     //     }
//     //     const payslips = await Payslip.findAll({
//     //         where: { user_id: user.id },
//     //         include: [{ model: Payroll, attributes: ['period_start', 'period_end'] }],
//     //         order: [['created_at', 'DESC']]
//     //     });
//     //     return { payslips };
//     // });

//     // Endpoint: admin list all payroll periods
//     // fastify.get('/payroll/periods', {
//     //     preHandler: [fastify.authenticate],
//     //     schema: {
//     //         summary: 'List all payroll periods',
//     //         description: 'Admin lists all payroll periods',
//     //         tags: ['Payroll'],
//     //         security: [{ bearerAuth: [] }],
//     //         response: {
//     //             200: {
//     //                 type: 'object',
//     //                 properties: {
//     //                     periods: { type: 'array', items: { type: 'object' } }
//     //                 }
//     //             },
//     //             401: { type: 'object', properties: { message: { type: 'string' } } },
//     //         },
//     //     }
//     // }, async (request, reply) => {
//     //     const { Payroll } = require('./models');
//     //     const user = request.user;
//     //     if (user.role !== 'admin') {
//     //         return reply.code(401).send({ message: 'Only admin can list payroll periods' });
//     //     }
//     //     const periods = await Payroll.findAll({ order: [['period_start', 'DESC']] });
//     //     return { periods };
//     // });

//     // Helper: count workdays (Mon-Fri) between two dates
//     function getWorkdays(start, end) {
//         const startDate = new Date(start);
//         const endDate = new Date(end);
//         let count = 0;
//         for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//             const day = d.getDay();
//             if (day !== 0 && day !== 6) count++;
//         }
//         return count;
//     }

//     // Helper: create audit log
//     async function createAuditLog({ table_name, record_id, action, changes, user_id, ip_address, request_id }) {
//         const { AuditLog } = require('./models');
//         await AuditLog.create({
//             table_name,
//             record_id,
//             action,
//             changes,
//             user_id,
//             ip_address,
//             request_id
//         });
//     }

//     // --- Audit log wrapper ---
//     function withAuditLog(handler, { table, action, getRecordId, getChanges }) {
//         return async function (request, reply) {
//             const result = await handler(request, reply);
//             // Only log if success (2xx)
//             if (reply.statusCode >= 200 && reply.statusCode < 300) {
//                 await createAuditLog({
//                     table_name: table,
//                     record_id: getRecordId(request, result),
//                     action,
//                     changes: getChanges(request, result),
//                     user_id: request.user?.id,
//                     ip_address: request.ip,
//                     request_id: request.id
//                 });
//             }
//             return result;
//         };
//     }

//     // Audit log for GET endpoints (payslip, summary, periods)
//     function withAuditLogGet(handler, { table, action, getRecordId, getChanges }) {
//         return async function (request, reply) {
//             const result = await handler(request, reply);
//             if (reply.statusCode >= 200 && reply.statusCode < 300) {
//                 await createAuditLog({
//                     table_name: table,
//                     record_id: getRecordId(request, result),
//                     action,
//                     changes: getChanges(request, result),
//                     user_id: request.user?.id,
//                     ip_address: request.ip,
//                     request_id: request.id
//                 });
//             }
//             return result;
//         };
//     }

//     const payslipListSchema = {
//         summary: 'Payroll summary',
//         description: 'Admin gets summary of all employee payslips for a payroll period',
//         tags: ['Payroll'],
//         security: [{ bearerAuth: [] }],
//         params: {
//             type: 'object',
//             properties: {
//                 payroll_id: { type: 'integer', description: 'Payroll period ID' }
//             },
//             required: ['payroll_id']
//         },
//         response: {
//             200: {
//                 type: 'object',
//                 properties: {
//                     summary: { type: 'array', items: { type: 'object' } },
//                     total_take_home_pay: { type: 'integer' }
//                 }
//             },
//             401: { type: 'object', properties: { message: { type: 'string' } } },
//         },
//     }

//     // Redefine GET /payslip/:payroll_id with audit log
//     const payslipByPayrollIdSchema = {
//         summary: 'Generate payslip',
//         description: 'Employee generates payslip for a payroll period',
//         tags: ['Payslip'],
//         security: [{ bearerAuth: [] }],
//         params: {
//             type: 'object',
//             properties: {
//                 payroll_id: { type: 'integer', description: 'Payroll period ID' }
//             },
//             required: ['payroll_id']
//         },
//         response: {
//             200: {
//                 type: 'object',
//                 properties: {
//                     payslip: { type: 'object' }
//                 }
//             },
//             404: { type: 'object', properties: { message: { type: 'string' } } },
//             401: { type: 'object', properties: { message: { type: 'string' } } },
//         },
//     };

//     const payrollPeriodsSchema = {
//         summary: 'List all payroll periods',
//             description: 'Admin lists all payroll periods',
//             tags: ['Payroll'],
//             security: [{ bearerAuth: [] }],
//             response: {
//                 200: {
//                     type: 'object',
//                     properties: {
//                         periods: { type: 'array', items: { type: 'object' } }
//                     }
//                 },
//                 401: { type: 'object', properties: { message: { type: 'string' } } },
//             },
//     }

//     fastify.route({
//         method: 'GET',
//         url: '/payslip/:payroll_id',
//         preHandler: [fastify.authenticate],
//         handler: withAuditLogGet(async (request, reply) => {
//             const { Payslip } = require('./models');
//             const user = request.user;
//             if (user.role !== 'employee') {
//                 return reply.code(401).send({ message: 'Only employees can generate payslip' });
//             }
//             const { payroll_id } = request.params;
//             const payslip = await Payslip.findOne({ where: { user_id: user.id, payroll_id } });
//             if (!payslip) {
//                 return reply.code(404).send({ message: 'Payslip not found for this period' });
//             }
//             return { payslip };
//         }, {
//             table: 'Payslip',
//             action: 'READ',
//             getRecordId: (req) => req.params.payroll_id,
//             getChanges: (req, res) => ({ payroll_id: req.params.payroll_id })
//         }),
//         schema: payslipByPayrollIdSchema
//     });

//     // Move the schema definition to a variable and reuse it for the route
//     const payrollSummarySchema = {
//         summary: 'Payroll summary',
//         description: 'Admin gets summary of all employee payslips for a payroll period',
//         tags: ['Payroll'],
//         security: [{ bearerAuth: [] }],
//         params: {
//             type: 'object',
//             properties: {
//                 payroll_id: { type: 'integer', description: 'Payroll period ID' }
//             },
//             required: ['payroll_id']
//         },
//         response: {
//             200: {
//                 type: 'object',
//                 properties: {
//                     summary: { type: 'array', items: { type: 'object' } },
//                     total_take_home_pay: { type: 'integer' }
//                 }
//             },
//             401: { type: 'object', properties: { message: { type: 'string' } } },
//         },
//     };
    
//     fastify.route({
//         method: 'GET',
//         url: '/payroll/:payroll_id/summary',
//         preHandler: [fastify.authenticate],
//         handler: withAuditLogGet(async (request, reply) => {
//             const { Payslip, User } = require('./models');
//             const user = request.user;
//             if (user.role !== 'admin') {
//                 return reply.code(401).send({ message: 'Only admin can get payroll summary' });
//             }
//             const { payroll_id } = request.params;
//             const payslips = await Payslip.findAll({ where: { payroll_id }, include: [{ model: User, attributes: ['username'] }] });
//             const summary = payslips.map(p => ({
//                 user_id: p.user_id,
//                 username: p.User ? p.User.username : undefined,
//                 take_home_pay: p.take_home_pay
//             }));
//             const total_take_home_pay = summary.reduce((sum, p) => sum + p.take_home_pay, 0);
//             return { summary, total_take_home_pay };
//         }, {
//             table: 'Payslip',
//             action: 'SUMMARY',
//             getRecordId: (req) => req.params.payroll_id,
//             getChanges: (req, res) => ({ payroll_id: req.params.payroll_id })
//         }),
//         schema: payrollSummarySchema
//     });

//     // Redefine GET /payslip (list all payslips for employee) with audit log
//     fastify.route({
//         method: 'GET',
//         url: '/payslip',
//         preHandler: [fastify.authenticate],
//         handler: withAuditLogGet(async (request, reply) => {
//             const { Payslip, Payroll } = require('./models');
//             const user = request.user;
//             if (user.role !== 'employee') {
//                 return reply.code(401).send({ message: 'Only employees can list payslips' });
//             }
//             const payslips = await Payslip.findAll({
//                 where: { user_id: user.id },
//                 include: [{ model: Payroll, attributes: ['period_start', 'period_end'] }],
//                 order: [['created_at', 'DESC']]
//             });
//             return { payslips };
//         }, {
//             table: 'Payslip',
//             action: 'LIST',
//             getRecordId: (req) => req.user.id,
//             getChanges: (req, res) => ({ user_id: req.user.id })
//         }),
//         schema: payslipListSchema
//     });

//     // Redefine GET /payroll/periods (list all payroll periods for admin) with audit log
//     fastify.route({
//         method: 'GET',
//         url: '/payroll/periods',
//         preHandler: [fastify.authenticate],
//         handler: withAuditLogGet(async (request, reply) => {
//             const { Payroll } = require('./models');
//             const user = request.user;
//             if (user.role !== 'admin') {
//                 return reply.code(401).send({ message: 'Only admin can list payroll periods' });
//             }
//             const periods = await Payroll.findAll({ order: [['period_start', 'DESC']] });
//             return { periods };
//         }, {
//             table: 'Payroll',
//             action: 'LIST',
//             getRecordId: (req) => req.user.id,
//             getChanges: (req, res) => ({ user_id: req.user.id })
//         }),
//         schema: payrollPeriodsSchema
//     });

//     // Endpoint: admin summary of all employee payslips (all periods)
//     fastify.route({
//         method: 'GET',
//         url: '/payroll/summary/all',
//         preHandler: [fastify.authenticate],
//         handler: withAuditLogGet(async (request, reply) => {
//             const { Payslip, User } = require('./models');
//             const user = request.user;
//             if (user.role !== 'admin') {
//                 return reply.code(401).send({ message: 'Only admin can get payroll summary' });
//             }
//             // Get all payslips, group by user
//             const payslips = await Payslip.findAll({ include: [{ model: User, attributes: ['username'] }] });
//             const summaryMap = {};
//             for (const p of payslips) {
//                 if (!summaryMap[p.user_id]) {
//                     summaryMap[p.user_id] = {
//                         user_id: p.user_id,
//                         username: p.User ? p.User.username : undefined,
//                         total_take_home_pay: 0
//                     };
//                 }
//                 summaryMap[p.user_id].total_take_home_pay += p.take_home_pay;
//             }
//             const summary = Object.values(summaryMap);
//             const total_take_home_pay = summary.reduce((sum, p) => sum + p.total_take_home_pay, 0);
//             return { summary, total_take_home_pay };
//         }, {
//             table: 'Payslip',
//             action: 'SUMMARY',
//             getRecordId: () => 'all',
//             getChanges: () => ({ all: true })
//         }),
//         schema: {
//             summary: 'All employee payslip summary',
//             description: 'Admin gets summary of all employee payslips (all periods)',
//             tags: ['Payroll'],
//             security: [{ bearerAuth: [] }],
//             response: {
//                 200: {
//                     type: 'object',
//                     properties: {
//                         summary: {
//                             type: 'array',
//                             items: {
//                                 type: 'object',
//                                 properties: {
//                                     user_id: { type: 'integer' },
//                                     username: { type: 'string' },
//                                     total_take_home_pay: { type: 'integer' }
//                                 }
//                             }
//                         },
//                         total_take_home_pay: { type: 'integer' }
//                     }
//                 },
//                 401: { type: 'object', properties: { message: { type: 'string' } } },
//             },
//         }
//     });

//     // Endpoint: admin generate payslip untuk beberapa employee sekaligus atau semua employee
//     fastify.route({
//         method: 'POST',
//         url: '/admin/generate-payslip',
//         preHandler: [fastify.authenticate],
//         handler: withAuditLog(async (request, reply) => {
//             const { Payroll, User, Attendance, Overtime, Reimbursement, Payslip } = require('./models');
//             const user = request.user;
//             if (user.role !== 'admin') {
//                 return reply.code(401).send({ message: 'Only admin can generate payslip' });
//             }
//             const { payroll_id, user_ids } = request.body;
//             const payroll = await Payroll.findByPk(payroll_id);
//             if (!payroll) {
//                 return reply.code(400).send({ message: 'Payroll period not found' });
//             }
//             if (!payroll.processed) {
//                 return reply.code(400).send({ message: 'Payroll must be processed first' });
//             }
//             let employees;
//             if (Array.isArray(user_ids) && user_ids.length > 0) {
//                 // Generate payslip untuk beberapa employee
//                 employees = await User.findAll({ where: { id: user_ids, role: 'employee' } });
//             } else {
//                 // Generate payslip untuk semua employee
//                 employees = await User.findAll({ where: { role: 'employee' } });
//             }
//             let generated = 0;
//             for (const emp of employees) {
//                 // Cek jika sudah ada payslip, skip
//                 const exists = await Payslip.findOne({ where: { user_id: emp.id, payroll_id } });
//                 if (exists) continue;
//                 // Attendance days in period
//                 const attendance = await Attendance.count({
//                     where: {
//                         user_id: emp.id,
//                         date: { $between: [payroll.period_start, payroll.period_end] }
//                     }
//                 });
//                 // Overtime in period
//                 const overtimeRows = await Overtime.findAll({
//                     where: {
//                         user_id: emp.id,
//                         date: { $between: [payroll.period_start, payroll.period_end] }
//                     }
//                 });
//                 const overtime_hours = overtimeRows.reduce((sum, row) => sum + row.hours, 0);
//                 // Reimbursement in period
//                 const reimbursements = await Reimbursement.findAll({
//                     where: {
//                         user_id: emp.id,
//                         created_at: { $between: [payroll.period_start, payroll.period_end] }
//                     }
//                 });
//                 const reimbursement_total = reimbursements.reduce((sum, row) => sum + row.amount, 0);
//                 // Salary calculation
//                 const total_workdays = getWorkdays(payroll.period_start, payroll.period_end);
//                 const prorated_salary = Math.round(emp.salary * (attendance / total_workdays));
//                 const overtime_pay = Math.round((emp.salary / total_workdays / 8) * overtime_hours * 2);
//                 const take_home_pay = prorated_salary + overtime_pay + reimbursement_total;
//                 // Payslip breakdown
//                 const breakdown = {
//                     attendance_days: attendance,
//                     total_workdays,
//                     prorated_salary,
//                     overtime_hours,
//                     overtime_pay,
//                     reimbursement_total,
//                     take_home_pay,
//                     reimbursements: reimbursements.map(r => ({ amount: r.amount, description: r.description }))
//                 };
//                 await Payslip.create({
//                     user_id: emp.id,
//                     payroll_id: payroll.id,
//                     attendance_days: attendance,
//                     overtime_hours,
//                     overtime_pay,
//                     reimbursement_total,
//                     take_home_pay,
//                     breakdown,
//                     created_by: user.id,
//                     created_ip: request.ip
//                 });
//                 generated++;
//             }
//             return { message: `Payslip generated for ${generated} employee(s)` };
//         }, {
//             table: 'Payslip',
//             action: 'PROCESS',
//             getRecordId: (req) => Array.isArray(req.body.user_ids) ? req.body.user_ids.join(',') : 'all',
//             getChanges: (req, res) => ({ payroll_id: req.body.payroll_id, user_ids: req.body.user_ids || 'all' })
//         }),
//         schema: {
//             summary: 'Admin generate payslip',
//             description: 'Admin generates payslip for specific employees (multiple) or all employees in a payroll period',
//             tags: ['Payslip', 'Admin'],
//             security: [{ bearerAuth: [] }],
//             body: {
//                 type: 'object',
//                 required: ['payroll_id'],
//                 properties: {
//                     payroll_id: { type: 'integer', description: 'Payroll period ID' },
//                     user_ids: {
//                         type: 'array',
//                         items: { type: 'integer' },
//                         description: 'Array of employee user IDs (optional, if not set will generate for all employees)'
//                     }
//                 }
//             },
//             response: {
//                 200: { type: 'object', properties: { message: { type: 'string' } } },
//                 400: { type: 'object', properties: { message: { type: 'string' } } },
//                 401: { type: 'object', properties: { message: { type: 'string' } } },
//                 404: { type: 'object', properties: { message: { type: 'string' } } },
//             },
//         }
//     });
// }

// const start = async () => {
//     try {
//         await sequelize.authenticate();
//         fastify.log.info("Database connected");

//         await registerPlugins();

//         await registerRoutes();

//         await fastify.listen({ port: process.env.PORT || 3000, host: "0.0.0.0" });
//     } catch (err) {
//         fastify.log.error(err);
//         process.exit(1);
//     }
// };

// start();