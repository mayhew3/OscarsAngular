import {socketServer} from '../www';

import {TypeORMManager} from '../typeorm/TypeORMManager';
import {getRepository} from 'typeorm';
import {Event} from '../typeorm/Event';
import {SystemVars} from '../typeorm/SystemVars';
import {NextFunction, Request, Response} from 'express/ts4.0';

export const getSystemVars = async (request: Request, response: Response): Promise<void> => {
  const systemVars = await getRepository(SystemVars).find();
  response.json(systemVars);
};

export const updateSystemVars = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  const systemVar = request.body;

  let result;
  try {
    result = await getRepository(SystemVars).findOne(systemVar.id);
  } catch (err) {
    next(err);
  }

  const isVotingOpenChanged = systemVar.voting_open !== undefined && result.voting_open !== systemVar.voting_open;

  try {
    await getRepository(SystemVars).update(systemVar.id, systemVar);
  } catch (err) {
    next(err);
  }

  if (isVotingOpenChanged) {
    const year = result.curr_year;
    const event_time = new Date();
    const event = await TypeORMManager.createAndCommit({
      type: 'voting',
      detail: !!systemVar.voting_open ? 'open' : 'locked',
      event_time,
      year
    }, Event);

    const msg = {
      event_id: event.id,
      event_time
    };

    if (systemVar.voting_open === false) {
      socketServer.emitToAll('voting_locked', msg);
    } else if (systemVar.voting_open === true) {
      socketServer.emitToAll('voting_unlocked', msg);
    }


  }

  response.json({msg: 'Success'});
};
