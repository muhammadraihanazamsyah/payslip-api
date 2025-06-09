const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class Reimbursement extends Model {}
Reimbursement.init({
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.STRING },
  created_by: { type: DataTypes.INTEGER },
  updated_by: { type: DataTypes.INTEGER },
  created_ip: { type: DataTypes.STRING },
  updated_ip: { type: DataTypes.STRING },
}, {
  sequelize,
  modelName: 'Reimbursement',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Reimbursement;
