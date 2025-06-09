const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class Payslip extends Model {}
Payslip.init({
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  payroll_id: { type: DataTypes.INTEGER, allowNull: false },
  attendance_days: { type: DataTypes.INTEGER, allowNull: false },
  overtime_hours: { type: DataTypes.INTEGER, allowNull: false },
  overtime_pay: { type: DataTypes.INTEGER, allowNull: false },
  reimbursement_total: { type: DataTypes.INTEGER, allowNull: false },
  take_home_pay: { type: DataTypes.INTEGER, allowNull: false },
  breakdown: { type: DataTypes.JSONB },
  created_by: { type: DataTypes.INTEGER },
  updated_by: { type: DataTypes.INTEGER },
  created_ip: { type: DataTypes.STRING },
  updated_ip: { type: DataTypes.STRING },
}, {
  sequelize,
  modelName: 'Payslip',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Payslip;
