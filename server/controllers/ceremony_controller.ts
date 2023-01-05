import _ from 'underscore';

import {getRepository} from 'typeorm';
import {Ceremony} from '../typeorm/Ceremony';
import {CeremonyYear} from '../typeorm/CeremonyYear';
import {GroupYear} from '../typeorm/GroupYear';
import {Nomination} from '../typeorm/Nomination';
import {Category} from '../typeorm/Category';
import {Event} from '../typeorm/Event';
import {TypeORMManager} from '../typeorm/TypeORMManager';
import {socketServer} from '../www';
import {Request, Response} from 'express';
import {VotingUnlockedMessage} from '../../src/shared/messages/VotingUnlockedMessage';
import {VotingLockedMessage} from '../../src/shared/messages/VotingLockedMessage';

export const getCeremonyYears = async (request: Request, response: Response): Promise<void> => {
  const ceremonies = await getRepository(Ceremony).find();
  const ceremonyYears = await getRepository(CeremonyYear).find();
  const groupYears = await getRepository(GroupYear).find();
  const nominations = await getRepository(Nomination).find();
  const categories = await getRepository(Category).find();

  for (const ceremony of ceremonies) {
    ceremony.ceremonyYears = _.where(ceremonyYears, {ceremony_id: ceremony.id});

    for (const ceremonyYear of ceremony.ceremonyYears) {
      ceremonyYear.groupYears = _.where(groupYears, {ceremony_year_id: ceremonyYear.id});
      const myCategories = _.where(categories, {ceremony_id: ceremony.id});
      const myNominations = _.filter(nominations, nomination => nomination.year === ceremonyYear.year &&
        !!_.findWhere(myCategories, {id: nomination.category_id}));
      ceremonyYear.nominationCount = myNominations.length;
    }
  }

  response.json(ceremonies);
};

export const addCeremonyYear = async (request: Request, response: Response): Promise<void> => {
  const ceremonyYearObj = request.body;

  const groupYearObjs: Partial<GroupYear>[] = ceremonyYearObj.groupYears;
  delete ceremonyYearObj.groupYears;

  const ceremonyYear = await TypeORMManager.createAndCommit(ceremonyYearObj, CeremonyYear);

  ceremonyYear.nominationCount = 0;
  ceremonyYear.groupYears = [];

  for (const groupYearObj of groupYearObjs) {
    groupYearObj.ceremony_year_id = ceremonyYear.id;
    const groupYear = await getRepository(GroupYear).save(groupYearObj);
    ceremonyYear.groupYears.push(groupYear);
  }

  socketServer.emitToAll('add_ceremony_year', ceremonyYear);

  response.json(ceremonyYear);
};

export const updateCeremonyYear = async (request: Request, response: Response): Promise<void> => {
  const ceremonyYearObj = request.body;

  const repository = getRepository(CeremonyYear);
  const result = await repository.findOne(ceremonyYearObj.id);

  if (!result) {
    throw new Error(`No ceremony_year found with id ${ceremonyYearObj.id}`);
  }

  const isVotingClosedChanged = result.voting_closed !== ceremonyYearObj.voting_closed;

  await repository.update(ceremonyYearObj.id, ceremonyYearObj);

  if (isVotingClosedChanged) {
    const year = result.year;
    const event_time = !result.voting_closed ? new Date() : result.voting_closed;
    const event = await TypeORMManager.createAndCommit({
      type: 'voting',
      detail: !ceremonyYearObj.voting_closed ? 'open' : 'closed',
      event_time,
      year,
      ceremony_year_id: ceremonyYearObj.id
    }, Event);

    const msg: VotingUnlockedMessage = {
      event_id: event.id,
      event_time: event_time.toString(),
      ceremony_year_id: ceremonyYearObj.id
    };

    if (!ceremonyYearObj.voting_closed) {
      socketServer.emitToAll('voting_unlocked', msg);
    } else {
      const lockMsg: VotingLockedMessage = {
        ...msg,
        voting_closed: ceremonyYearObj.voting_closed
      };
      socketServer.emitToAll('voting_locked', lockMsg);
    }

    response.json({msg: 'Success'});
  }
};
