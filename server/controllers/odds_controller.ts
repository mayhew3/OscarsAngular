import * as model from './model';
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const attachOddsToExecution = (execution, response) => {
  model.OddsResult.findAll({
    where: {
      odds_execution_id: execution.id
    }
  }).then(odds => {
    execution.dataValues.odds = odds;
    response.json(execution);
  });
};

const handleFirstOdds = (year: number, response: any) => {
  model.OddsExecution.findAll({
    where: {
      time_finished: {
        [Op.ne]: null
      },
      year
    },
    limit: 1,
    order:
      [
        ['time_finished', 'DESC']
      ]
  }).then(executions => {
    if (executions.length === 0) {
      response.json({});
    } else {
      attachOddsToExecution(executions[0], response);
    }
  });
};

const handleOddsForEventID = (event_id: number, year: number, response) => {
  model.OddsExecution.findAll({
    where: {
      event_id: {
        [Op.ne]: null,
        [Op.gte]: event_id
      },
      time_finished: {
        [Op.ne]: null
      },
      year
    },
    limit: 1,
    order:
      [
        ['event_id', 'DESC']
      ]
  }).then(executions => {
    if (executions.length === 0) {
      response.json({});
    } else {
      attachOddsToExecution(executions[0], response);
    }
  });
};

export const getMostRecentOddsBundle = (request, response) => {
  const year = +request.query.year;
  if (request.query.event_id) {
    handleOddsForEventID(+request.query.event_id, year, response);
  } else {
    handleFirstOdds(year, response);
  }
};

export const updateOddsForNominees = async (request, response) => {
  const changes = request.body.changes;

  const updates = [];

  for (const change of changes) {
    const nomination_id = change.nomination_id;
    delete change.nomination_id;
    const nomination = await model.Nomination.findByPk(nomination_id);
    updates.push(nomination.update(change));
  }

  Promise.all(updates).then(() => {
    response.json({msg: 'Success!'});
  });
};
