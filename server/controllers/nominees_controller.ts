import * as model from './model';
import _ from 'underscore';

export const getCategories = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  model.Category.findAll({
    where: {
      ceremony_id: 2
    },
    order:
      [
        ['points', 'DESC'],
        ['name', 'ASC']
      ]
  }).then(categories => {
    const currentYear = request.query.year;
    model.Nomination.findAll({
      where: {
        year: currentYear
      }
    }).then(nominations => {
      const outputObject = [];

      model.Vote.findAll({
        where: {
          person_id: request.query.person_id,
          year: currentYear
        }
      }).then(votes => {

        model.Winner.findAll({
          where: {
            year: currentYear
          }
        }).then(winners => {

          _.forEach(categories, category => {
            const cat_noms = _.where(nominations, {category_id: category.id});
            const cat_votes = _.where(votes, {category_id: category.id});
            const cat_winners = _.where(winners, {category_id: category.id});

            if (cat_votes.length > 1) {
              throw new Error('Multiple votes found for category ' + category.id);
            }

            const category_object = category.dataValues;

            if (cat_votes.length > 0) {
              category_object.voted_on = cat_votes[0].dataValues.nomination_id;
            }

            category_object.winners = cat_winners;
            category_object.nominees = cat_noms;

            outputObject.push(category_object);
          });

          response.json(outputObject);
        });
      });
    });
  });
};

export const updateNomination = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const nomination = request.body;

  model.Nomination.findByPk(nomination.id).then(result => {
    result.update(nomination).then(() => {
      response.json({msg: 'Success!'});
    }).catch(error => {
      console.error(error);
      response.send({msg: 'Error updating nominee: ' + JSON.stringify(nomination)});
    });
  }).catch(error => {
    console.error(error);
    response.send({msg: 'Error finding nomination: ' + error});
  });
};

export const getMostRecentYear = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const maxYear = await model.Nomination.max('year');

  response.json([{maxYear}]);
};
