const model = require('./model');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.getMostRecentOddsBundle = function(request, response) {
  if (request.query.event_id) {
    handleOddsForEventID(request.query.event_id, response);
  } else {
    handleFirstOdds(response);
  }
};

exports.updateOddsForNominees = async function(request, response) {
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
}

function handleFirstOdds(response) {
  model.OddsExecution.findAll({
    where: {
      time_finished: {
        [Op.ne]: null
      }
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
}

function handleOddsForEventID(event_id, response) {
  model.OddsExecution.findAll({
    where: {
      event_id: {
        [Op.ne]: null,
        [Op.gte]: event_id
      },
      time_finished: {
        [Op.ne]: null
      }
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
}

function attachOddsToExecution(execution, response) {
  model.OddsResult.findAll({
    where: {
      odds_execution_id: execution.id
    }
  }).then(odds => {
    execution.dataValues.odds = odds;
    response.json(execution);
  });
}
