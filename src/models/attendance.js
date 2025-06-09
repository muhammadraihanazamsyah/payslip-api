const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class Attendance extends Model {}
Attendance.init({
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  created_by: { type: DataTypes.INTEGER },
  updated_by: { type: DataTypes.INTEGER },
  created_ip: { type: DataTypes.STRING },
  updated_ip: { type: DataTypes.STRING },
}, {
  sequelize,
  modelName: 'Attendance',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [{ unique: true, fields: ['user_id', 'date'] }]
});

module.exports = Attendance;
