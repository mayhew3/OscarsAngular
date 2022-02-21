import _ from 'underscore';

import {getRepository} from 'typeorm';
import {Ceremony} from '../typeorm/Ceremony';
import {CeremonyYear} from '../typeorm/CeremonyYear';
import {GroupYear} from '../typeorm/GroupYear';
import {Nomination} from '../typeorm/Nomination';
import {Category} from '../typeorm/Category';
import {TypeORMManager} from '../typeorm/TypeORMManager';
import {socketServer} from '../www';

export const getCeremonyYears = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
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

export const addCeremonyYear = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const ceremonyYearObj = request.body;

  const ceremonyYear = await TypeORMManager.createAndCommit(ceremonyYearObj, CeremonyYear);

  ceremonyYear.nominationCount = 0;
  ceremonyYear.groupYears = [];

  socketServer.emitToAll('add_ceremony_year', ceremonyYear);

  response.json(ceremonyYear);
};
