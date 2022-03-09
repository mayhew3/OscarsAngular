import {Nomination} from '../typeorm/Nomination';
import {getConnection, getRepository, IsNull, Not, UpdateResult} from 'typeorm';
import {OddsExecution} from '../typeorm/OddsExecution';
import {OddsResult} from '../typeorm/OddsResult';
import {Request, Response, NextFunction} from 'express/ts4.0';

const attachOddsToExecution = async (execution: OddsExecution, response: Response): Promise<void> => {
  execution.odds = await getRepository(OddsResult).find({
    where: {
      odds_execution_id: execution.id
    }
  });
  response.json(execution);
};

const handleFirstOdds = async (year: number, response: Response): Promise<void> => {
  const executions = await getRepository(OddsExecution).find({
    where: {
      time_finished: Not(IsNull()),
      year
    },
    take: 1,
    order: {
      time_finished: 'DESC'
    }
  });

  if (executions.length === 0) {
    response.json({});
  } else {
    await attachOddsToExecution(executions[0], response);
  }
};

// todo: remove if unneeded
// noinspection JSUnusedLocalSymbols
const handleOddsForEventID = async (event_id: number, year: number, response: Response): Promise<void> => {

  const executions = await getConnection()
    .createQueryBuilder()
    .select('odds_execution')
    .from(OddsExecution, 'odds_execution')
    .where('odds_execution.event_id IS NOT NULL')
    .andWhere('odds_execution.event_id > :event_id', {event_id})
    .andWhere('odds_execution.time_finished IS NOT NULL')
    .andWhere('odds_execution.year = :year', {year})
    .getMany()
  ;

  if (executions.length === 0) {
    response.json({});
  } else {
    await attachOddsToExecution(executions[0], response);
  }

};

export const getMostRecentOddsBundle = async (request: Request, response: Response,
                                              next: NextFunction): Promise<void> => {
  if (!request.query.year) {
    return next(new Error('No year attached to request!'));
  }
  const year = +request.query.year;
  await handleFirstOdds(year, response);
};

export const updateOddsForNominees = async (request: Request, response: Response): Promise<void> => {
  const changes: any[] = request.body.changes;

  const updates: Promise<UpdateResult>[] = [];

  for (const change of changes) {
    const nomination_id = change.nomination_id;
    delete change.nomination_id;
    const nominationRepository = getRepository(Nomination);
    const nominee = nominationRepository.update(nomination_id, change);
    updates.push(nominee);
  }

  Promise.all(updates).then(() => {
    response.json({msg: 'Success!'});
  });
};
