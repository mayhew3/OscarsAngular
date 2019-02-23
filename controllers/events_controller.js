const model = require('./model');
const _ = require('underscore');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.getRecentEvents = function(request, response) {
  const sinceDate1 = +request.query.since_date;
  const sinceDate = new Date(sinceDate1);
  model.Event.findAll({
    where: {
      event_time: {
        [Op.gt]: sinceDate
      }
    }
  }).then(events => {
    return response.json(events);
  });
};

exports.addEvent = function(type, detail, nomination_id, prevResult, response) {
  model.Event.create({
    type: type,
    detail: detail,
    event_time: new Date,
    nomination_id: nomination_id
  }).then(() => {
    response.json(prevResult);
  });
};
