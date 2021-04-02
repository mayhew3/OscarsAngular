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

exports.Event = sequelize.sequelize.define("event", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  type: Sequelize.TEXT,
  detail: Sequelize.TEXT,
  nomination_id: Sequelize.INTEGER,
  event_time: Sequelize.DATE
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
  middle_name: Sequelize.TEXT,
  role: Sequelize.TEXT,
  email: Sequelize.TEXT,
  odds_filter: Sequelize.TEXT,
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

exports.Winner = sequelize.sequelize.define("winner", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  category_id: Sequelize.INTEGER,
  nomination_id: Sequelize.INTEGER,
  declared: Sequelize.DATE,
  year: Sequelize.INTEGER
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});

exports.SystemVars = sequelize.sequelize.define("system_vars", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  curr_year: Sequelize.INTEGER,
  voting_open: Sequelize.BOOLEAN
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});


exports.OddsResult = sequelize.sequelize.define("odds_result", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  odds: Sequelize.INTEGER,
  person_id: Sequelize.INTEGER,
  clinched: Sequelize.BOOLEAN,
  odds_execution_id: Sequelize.INTEGER
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});

exports.OddsExecution = sequelize.sequelize.define("odds_execution", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  event_id: Sequelize.INTEGER,
  time_finished: Sequelize.DATE
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});

exports.FinalResult = sequelize.sequelize.define("final_result", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  person_id: Sequelize.INTEGER,
  group_year_id: Sequelize.INTEGER,
  score: Sequelize.INTEGER,
  correct_count: Sequelize.INTEGER,
  rank: Sequelize.INTEGER,
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});

exports.GroupYear = sequelize.sequelize.define("group_year", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  person_group_id: Sequelize.INTEGER,
  year: Sequelize.INTEGER,
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});
