// noinspection ExceptionCaughtLocallyJS

import {socketServer} from '../www';

import {TypeORMManager} from '../typeorm/TypeORMManager';
import {getRepository} from 'typeorm';
import {Event} from '../typeorm/Event';
import {SystemVars} from '../typeorm/SystemVars';
import {NextFunction, Request, Response} from 'express/ts4.0';
import {Ceremony} from '../typeorm/Ceremony';
import {CeremonyYear} from '../typeorm/CeremonyYear';

export const getSystemVars = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    const systemVarsArray = await getRepository(SystemVars).find();
    if (systemVarsArray.length !== 1) {
      throw new Error('Expected exactly one row in system_vars!');
    }
    const systemVars = systemVarsArray[0];

    const ceremonyYear = await getRepository(CeremonyYear).findOne(systemVars.ceremony_year_id);
    if (!ceremonyYear) {
      throw new Error('No ceremonyYear found with id: ' + systemVars.ceremony_year_id);
    }
    const ceremony = await getRepository(Ceremony).findOne(ceremonyYear.ceremony_id);
    if (!ceremony) {
      throw new Error('No ceremony found with id: ' + ceremonyYear.ceremony_id);
    }

    const data = {
      id: systemVars.id,
      voting_open: !ceremonyYear.voting_closed,
      ceremony_year_id: systemVars.ceremony_year_id,
      curr_year: ceremonyYear.year,
      ceremony_name: ceremony.name,
      ceremony_start: ceremonyYear.ceremony_date
    };

    response.json([data]);
  } catch (err) {
    next(err);
  }
};

export const updateSystemVars = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    const systemVar = request.body;

    const result = await getRepository(SystemVars).findOne(systemVar.id);

    if (!result) {
      throw new Error('No systemVars found with id: ' + systemVar.id);
    }

    const isVotingOpenChanged = systemVar.voting_open !== undefined && result.voting_open !== systemVar.voting_open;
    const ceremonyYearChanged = systemVar.ceremony_year_id !== undefined && result.ceremony_year_id !== systemVar.ceremony_year_id;

    await getRepository(SystemVars).update(systemVar.id, systemVar);

    if (ceremonyYearChanged) {
      const ceremonyYear = await getRepository(CeremonyYear).findOne(result.ceremony_year_id);
      if (!ceremonyYear) {
        throw new Error('No ceremonyYear found with id: ' + result.ceremony_year_id);
      }
      const ceremony = await getRepository(Ceremony).findOne(ceremonyYear.ceremony_id);
      if (!ceremony) {
        throw new Error('No ceremony found with id: ' + ceremonyYear.ceremony_id);
      }

      const msg = {
        ceremony_year_id: result.ceremony_year_id,
        year: ceremonyYear.year,
        ceremony_name: ceremony.name
      };

      socketServer.emitToAll('active_ceremony_changed', msg);
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
  } catch (err: any) {
    next(err);
  }
};
