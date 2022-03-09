import _ from 'underscore';
import {getRepository} from 'typeorm';
import {FinalResult} from '../typeorm/FinalResult';
import {GroupYear} from '../typeorm/GroupYear';
import {FinalResult as FinalResultObj} from '../../src/app/interfaces/FinalResult';

export const getFinalResults = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const finalResults = await getRepository(FinalResult).find({
    order:
      {
        group_year_id: 'DESC',
        score: 'DESC'
      }
  });

  const groupYears = await getRepository(GroupYear).find();

  const outputObject: FinalResultObj[] = [];

  _.forEach(finalResults, finalResult => {
    const groupYear = _.findWhere(groupYears, {id: finalResult.group_year_id});
    if (!groupYear) {
      throw new Error('No group year found with ID ' + finalResult.group_year_id);
    }
    const result_obj: FinalResultObj & FinalResult = JSON.parse(JSON.stringify(finalResult));

    delete result_obj.group_year_id;

    result_obj.group_id = groupYear.person_group_id;
    result_obj.year = groupYear.year;

    outputObject.push(result_obj);
  });

  response.json(outputObject);
};
