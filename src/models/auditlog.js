const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class AuditLog extends Model {}
AuditLog.init({
  table_name: { type: DataTypes.STRING, allowNull: false },
  record_id: { type: DataTypes.INTEGER, allowNull: false },
  action: { type: DataTypes.STRING, allowNull: false },
  changes: { type: DataTypes.JSONB },
  user_id: { type: DataTypes.INTEGER },
  ip_address: { type: DataTypes.STRING },
  request_id: { type: DataTypes.STRING },
}, {
  sequelize,
  modelName: 'AuditLog',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = AuditLog;
