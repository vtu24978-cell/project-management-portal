const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';
const dialect = process.env.DB_DIALECT || 'sqlite';

let sequelize;

if (dialect === 'sqlite') {
  const storagePath = isTest 
    ? ':memory:' 
    : path.resolve(__dirname, '..', process.env.DB_STORAGE || 'database.sqlite');
  
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: isTest ? false : console.log,
    define: {
      timestamps: true,
      underscored: true
    }
  });
} else if (dialect === 'mysql') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'task_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'mysql',
      logging: isTest ? false : console.log,
      define: {
        timestamps: true,
        underscored: true
      }
    }
  );
} else {
  throw new Error(`Unsupported database dialect: ${dialect}`);
}

module.exports = sequelize;
