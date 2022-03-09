import {getRepository, MoreThan} from 'typeorm';

import {Event} from '../typeorm/Event';
import {Request, Response} from 'express/ts4.0';

export const getRecentEvents = async (request: Request, response: Response): Promise<void> => {
  const sinceDate1 = +request.query.since_date;
  const sinceDate = new Date(sinceDate1);
  const events = await getRepository(Event).find({
    where: {
      event_time: MoreThan(sinceDate)
    }
  });
  response.json(events);
};
