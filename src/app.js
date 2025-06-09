// src/app.js
const fastify = require('fastify')({ logger: true });
const { sequelize } = require('./models');
const fastifyCors = require('@fastify/cors');
const fastifyJwt = require('@fastify/jwt');
const fastifySwagger = require('@fastify/swagger');
const fastifySwaggerUi = require('@fastify/swagger-ui');
const fastifyRequestId = require('fastify-request-id');

// Register plugins
async function registerPlugins() {
    await fastify.register(fastifyCors, { origin: true });
    await fastify.register(fastifyJwt, { secret: process.env.JWT_SECRET || 'supersecret' });
    await fastify.register(fastifySwagger, {
        swagger: {
            info: { title: 'Payslip API', version: '1.0.0' },
            securityDefinitions: {
                bearerAuth: {
                    type: 'apiKey',
                    name: 'Authorization',
                    in: 'header',
                    description: 'Enter JWT token like: Bearer <token>'
                }
            },
            security: [{ bearerAuth: [] }],
            tags: [
                { name: 'Auth', description: 'Authentication & Authorization' },
                { name: 'Attendance', description: 'Attendance Management' },
                { name: 'Overtime', description: 'Overtime Management' },
                { name: 'Reimbursement', description: 'Reimbursement Management' },
                { name: 'Payroll', description: 'Payroll Period & Run' },
                { name: 'Payslip', description: 'Payslip Generation & Retrieval' },
                // { name: 'User', description: 'User Management' },
                { name: 'AuditLog', description: 'Audit Log & Trail' }
            ]
        },
    });
    await fastify.register(fastifySwaggerUi, {
        routePrefix: '/docs',
        uiConfig: { docExpansion: 'list', deepLinking: false },
        staticCSP: true,
        transformStaticCSP: (header) => header,
        exposeRoute: true,
    });
    await fastify.register(fastifyRequestId);
}

// Register routes
async function registerRoutes() {
    await fastify.register(require('./routes/authRoutes'));
    await fastify.register(require('./routes/attendanceRoutes'));
    await fastify.register(require('./routes/overtimeRoutes'));
    await fastify.register(require('./routes/reimbursementRoutes'));
    await fastify.register(require('./routes/payrollRoutes'));
    await fastify.register(require('./routes/payslipRoutes'));
    await fastify.register(require('./routes/userRoutes'));
    await fastify.register(require('./routes/auditLogRoutes'));
}

const start = async () => {
    try {
        await sequelize.authenticate();
        fastify.log.info('Database connected');
        await registerPlugins();
        await registerRoutes();
        await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
