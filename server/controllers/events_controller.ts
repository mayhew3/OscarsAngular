import * as model from './model';
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

export const getRecentEvents = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
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
