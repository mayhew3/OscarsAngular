import {getRepository, MoreThan} from 'typeorm';

import {Event} from '../typeorm/Event';

export const getRecentEvents = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const sinceDate1 = +request.query.since_date;
  const sinceDate = new Date(sinceDate1);
  const events = await getRepository(Event).find({
    where: {
      event_time: MoreThan(sinceDate)
    }
  });
  response.json(events);
};
