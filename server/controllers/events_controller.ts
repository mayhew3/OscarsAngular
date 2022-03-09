import {getRepository, MoreThan} from 'typeorm';

import {Event} from '../typeorm/Event';
import {NextFunction, Request, Response} from 'express/ts4.0';

export const getRecentEvents = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  if (!request.query.since_date) {
    return next(new Error('No since_date attached to request!'));
  }
  const sinceDate1 = +request.query.since_date;
  const sinceDate = new Date(sinceDate1);
  const events = await getRepository(Event).find({
    where: {
      event_time: MoreThan(sinceDate)
    }
  });
  response.json(events);
};
