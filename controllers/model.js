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
  detail: Sequelize.TEXT,
  year: Sequelize.INTEGER,
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

exports.Person = sequelize.sequelize.define("person", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  first_name: Sequelize.TEXT,
  last_name: Sequelize.TEXT,
  role: Sequelize.TEXT,
  email: Sequelize.TEXT
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});

exports.PersonGroupRole = sequelize.sequelize.define("person_group_role", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  person_group_id: Sequelize.INTEGER,
  person_id: Sequelize.INTEGER
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});

exports.Vote = sequelize.sequelize.define("vote", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  category_id: Sequelize.INTEGER,
  nomination_id: Sequelize.INTEGER,
  person_id: Sequelize.INTEGER,
  year: Sequelize.INTEGER
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});
