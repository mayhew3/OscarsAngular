const Sequelize = require('sequelize');
let config = process.env.DATABASE_URL;

exports.sequelize = new Sequelize(config, {
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  operatorsAliases: false
});

