import * as model from './model';
import _ from 'underscore';

export const getFinalResults = async function(request, response) {
  const finalResults = await model.FinalResult.findAll({
    order:
    [
      ['group_year_id', 'DESC'],
      ['score', 'DESC']
    ]
  });

  const groupYears = await model.GroupYear.findAll();

  const outputObject = [];

  _.forEach(finalResults, finalResult => {
    const groupYear = _.findWhere(groupYears, {id: finalResult.group_year_id});
    const result_obj = finalResult.dataValues;

    delete result_obj.group_year_id;

    result_obj.group_id = groupYear.person_group_id;
    result_obj.year = groupYear.year;

    outputObject.push(result_obj);
  });

  response.json(outputObject);
};
