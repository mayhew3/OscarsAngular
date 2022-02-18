import _ from 'underscore';

import {getRepository} from 'typeorm';
import {Ceremony} from '../typeorm/Ceremony';
import {CeremonyYear} from '../typeorm/CeremonyYear';
import {GroupYear} from '../typeorm/GroupYear';
import {PersonGroup} from '../typeorm/PersonGroup';

export const getCeremonyYears = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const ceremonies = await getRepository(Ceremony).find();
  const groups = await getRepository(PersonGroup).find();
  const ceremonyYears = await getRepository(CeremonyYear).find();
  const groupYears = await getRepository(GroupYear).find();

  for (const ceremony of ceremonies) {
    ceremony.ceremonyYears = _.where(ceremonyYears, {ceremony_id: ceremony.id});

    for (const ceremonyYear of ceremony.ceremonyYears) {
      ceremonyYear.groupYears = _.where(groupYears, {ceremony_year_id: ceremonyYear.id});
    }
  }

  response.json({
    ceremonies,
    groups
  });
};
