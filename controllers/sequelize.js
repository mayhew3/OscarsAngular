const Sequelize = require('sequelize');
let config = process.env.DATABASE_URL;

exports.sequelize = new Sequelize(config, {
  dialect: 'postgres',
  ssl: true,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

