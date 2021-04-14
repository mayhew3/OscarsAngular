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
