import {getRepository, MoreThan} from 'typeorm';

import {Event} from '../typeorm/Event';
import {Request, Response} from 'express';

export const getRecentEvents = async (request: Request, response: Response): Promise<void> => {
  if (!request.query.since_date) {
    throw new Error('No since_date attached to request!');
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
