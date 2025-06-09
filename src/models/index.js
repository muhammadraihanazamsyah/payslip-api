const sequelize = require('./sequelize');
const User = require('./user');
const Attendance = require('./attendance');
const Overtime = require('./overtime');
const Reimbursement = require('./reimbursement');
const Payroll = require('./payroll');
const Payslip = require('./payslip');
const AuditLog = require('./auditlog');

// Associations
User.hasMany(Attendance, { foreignKey: 'user_id' });
Attendance.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Overtime, { foreignKey: 'user_id' });
Overtime.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Reimbursement, { foreignKey: 'user_id' });
Reimbursement.belongsTo(User, { foreignKey: 'user_id' });
Payroll.hasMany(Payslip, { foreignKey: 'payroll_id' });
Payslip.belongsTo(Payroll, { foreignKey: 'payroll_id' });
User.hasMany(Payslip, { foreignKey: 'user_id' });
Payslip.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
    sequelize,
    User,
    Attendance,
    Overtime,
    Reimbursement,
    Payroll,
    Payslip,
    AuditLog
};
