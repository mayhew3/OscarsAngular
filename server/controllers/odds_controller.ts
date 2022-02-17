import {Nomination} from '../typeorm/Nomination';
import {getConnection, getRepository, IsNull, Not} from 'typeorm';
import {OddsExecution} from '../typeorm/OddsExecution';
import {OddsResult} from '../typeorm/OddsResult';

const attachOddsToExecution = async (execution: OddsExecution, response: Record<string, any>): Promise<void> => {
  execution.odds = await getRepository(OddsResult).find({
    where: {
      odds_execution_id: execution.id
    }
  });
  response.json(execution);
};

const handleFirstOdds = async (year: number, response: Record<string, any>): Promise<void> => {
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

const handleOddsForEventID = async (event_id: number, year: number, response: Record<string, any>): Promise<void> => {

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

export const getMostRecentOddsBundle = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const year = +request.query.year;
  if (request.query.event_id) {
    await handleOddsForEventID(+request.query.event_id, year, response);
  } else {
    await handleFirstOdds(year, response);
  }
};

export const updateOddsForNominees = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const changes = request.body.changes;

  const updates = [];

  for (const change of changes) {
    const nomination_id = change.nomination_id;
    delete change.nomination_id;
    const nominationRepository = getRepository(Nomination);
    updates.push(nominationRepository.update(nomination_id, change));
  }

  Promise.all(updates).then(() => {
    response.json({msg: 'Success!'});
  });
};
