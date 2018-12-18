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
  odds_expert: Sequelize.DECIMAL,
  odds_user: Sequelize.DECIMAL,
  odds_numerator: Sequelize.INTEGER,
  odds_denominator: Sequelize.INTEGER,
  category_id: Sequelize.INTEGER
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});
