const Sequelize = require('sequelize');
const sequelize = require('./sequelize');

exports.Category = sequelize.sequelize.define("category", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  name: Sequelize.TEXT,
  points: Sequelize.INTEGER
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});

exports.Nomination = sequelize.sequelize.define("nomination", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  nominee: Sequelize.TEXT,
  context: Sequelize.TEXT,
  odds: Sequelize.DECIMAL,
  category_id: Sequelize.INTEGER
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});
