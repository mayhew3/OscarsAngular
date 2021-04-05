import * as model from './model';
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

export const getRecentEvents = (request, response) => {
  const sinceDate1 = +request.query.since_date;
  const sinceDate = new Date(sinceDate1);
  model.Event.findAll({
    where: {
      event_time: {
        [Op.gt]: sinceDate
      }
    }
  }).then(events => response.json(events));
};

export const addEvent = (type, detail, nomination_id, prevResult, response) => {
  model.Event.create({
    type,
    detail,
    event_time: new Date(),
    nomination_id
  }).then(() => {
    response.json(prevResult);
  });
};
