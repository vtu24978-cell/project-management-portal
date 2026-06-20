const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Task title is required' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: {
        args: [20, 5000],
        msg: 'Description must be at least 20 characters long'
      }
    }
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Pending',
    validate: {
      isIn: {
        args: [['Pending', 'In Progress', 'Completed']],
        msg: 'Status must be Pending, In Progress, or Completed'
      }
    }
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: { msg: 'Due date must be a valid date' }
    }
  },
  assigneeName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  assigneeEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: { msg: 'Please enter a valid email address for the assignee' }
    }
  }
});

// Associations
User.hasMany(Task, { foreignKey: 'userId', onDelete: 'CASCADE' });
Task.belongsTo(User, { foreignKey: 'userId' });

module.exports = Task;
