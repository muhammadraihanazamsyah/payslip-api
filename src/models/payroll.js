const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class Payroll extends Model {}
Payroll.init({
  period_start: { type: DataTypes.DATEONLY, allowNull: false },
  period_end: { type: DataTypes.DATEONLY, allowNull: false },
  processed: { type: DataTypes.BOOLEAN, defaultValue: false },
  processed_at: { type: DataTypes.DATE },
  created_by: { type: DataTypes.INTEGER },
  updated_by: { type: DataTypes.INTEGER },
  created_ip: { type: DataTypes.STRING },
  updated_ip: { type: DataTypes.STRING },
}, {
  sequelize,
  modelName: 'Payroll',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Payroll;
