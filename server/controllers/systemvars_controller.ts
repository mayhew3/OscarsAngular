// noinspection ExceptionCaughtLocallyJS

import {socketServer} from '../www';
import {getRepository} from 'typeorm';
import {SystemVars} from '../typeorm/SystemVars';
import {Request, Response} from 'express';
import {Ceremony} from '../typeorm/Ceremony';
import {CeremonyYear} from '../typeorm/CeremonyYear';

export const getSystemVars = async (request: Request, response: Response): Promise<void> => {
  const systemVarsArray = await getRepository(SystemVars).find();
  if (systemVarsArray.length !== 1) {
    throw new Error('Expected exactly one row in system_vars!');
  }
  const systemVars = systemVarsArray[0];

  const ceremonyYear = await getRepository(CeremonyYear).findOneBy({id: systemVars.ceremony_year_id});
  if (!ceremonyYear) {
    throw new Error('No ceremonyYear found with id: ' + systemVars.ceremony_year_id);
  }
  const ceremony = await getRepository(Ceremony).findOneBy({id: ceremonyYear.ceremony_id});
  if (!ceremony) {
    throw new Error('No ceremony found with id: ' + ceremonyYear.ceremony_id);
  }

  const data = {
    id: systemVars.id,
    voting_open: !ceremonyYear.voting_closed,
    ceremony_year_id: systemVars.ceremony_year_id,
    curr_year: ceremonyYear.year,
    ceremony_name: ceremony.name,
    ceremony_id: ceremony.id,
    ceremony_start: ceremonyYear.ceremony_date
  };

  response.json([data]);
};

export const updateSystemVars = async (request: Request, response: Response): Promise<void> => {
  const systemVar = request.body;

  const result = await getRepository(SystemVars).findOne(systemVar.id);

  if (!result) {
    throw new Error('No systemVars found with id: ' + systemVar.id);
  }

  const ceremonyYearChanged = systemVar.ceremony_year_id !== undefined && result.ceremony_year_id !== systemVar.ceremony_year_id;

  await getRepository(SystemVars).update(systemVar.id, systemVar);

  if (ceremonyYearChanged) {
    const ceremonyYear = await getRepository(CeremonyYear).findOne(systemVar.ceremony_year_id);
    if (!ceremonyYear) {
      throw new Error('No ceremonyYear found with id: ' + systemVar.ceremony_year_id);
    }
    const ceremony = await getRepository(Ceremony).findOneBy({id: ceremonyYear.ceremony_id});
    if (!ceremony) {
      throw new Error('No ceremony found with id: ' + ceremonyYear.ceremony_id);
    }

    const msg = {
      ceremony_year_id: systemVar.ceremony_year_id,
      year: ceremonyYear.year,
      ceremony_name: ceremony.name,
      ceremony_id: ceremony.id,
      voting_open: !ceremonyYear.voting_closed,
      ceremony_start: ceremonyYear.ceremony_date
    };

    socketServer.emitToAll('active_ceremony_changed', msg);
  }

  response.json({msg: 'Success'});
};

export const getCurrentCeremonyYear = async (): Promise<number> => {
  const allSystemVars = await getRepository(SystemVars).find();
  if (allSystemVars.length > 1) {
    throw new Error('Multiple rows found in SystemVars!');
  }
  const systemVars = allSystemVars[0];
  return systemVars.ceremony_year_id;
};
