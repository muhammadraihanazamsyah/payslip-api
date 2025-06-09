const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class User extends Model {}
User.init({
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  salary: { type: DataTypes.INTEGER, allowNull: false },
  role: { type: DataTypes.ENUM('employee', 'admin'), allowNull: false },
  created_by: { type: DataTypes.INTEGER },
  updated_by: { type: DataTypes.INTEGER },
  created_ip: { type: DataTypes.STRING },
  updated_ip: { type: DataTypes.STRING },
}, {
  sequelize,
  modelName: 'User',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = User;
