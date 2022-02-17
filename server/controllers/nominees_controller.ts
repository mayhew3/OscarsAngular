import _ from 'underscore';
import {getConnection, getRepository} from 'typeorm';
import {Nomination} from '../typeorm/Nomination';
import {Category} from '../typeorm/Category';
import {Vote} from '../typeorm/Vote';
import {Winner} from '../typeorm/Winner';

export const getCategories = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const categories = await getRepository(Category).find({
    where: {
      ceremony_id: 2
    },
    order:
      {
        points: 'DESC',
        name: 'ASC'
      }
  });
  const currentYear = +request.query.year;

  const nominations = await getRepository(Nomination).find({
    where: {
      year: currentYear
    }
  });
  const outputObject = [];

  const votes = await getRepository(Vote).find({
    where: {
      person_id: +request.query.person_id,
      year: currentYear
    }
  });

  const winners = await getRepository(Winner).find({
    where: {
      year: currentYear
    }
  });

  _.forEach(categories, category => {
    const cat_noms = _.where(nominations, {category_id: category.id});
    const cat_votes = _.where(votes, {category_id: category.id});
    const cat_winners = _.where(winners, {category_id: category.id});

    if (cat_votes.length > 1) {
      throw new Error('Multiple votes found for category ' + category.id);
    }

    const category_object = JSON.parse(JSON.stringify(category));

    if (cat_votes.length > 0) {
      category_object.voted_on = cat_votes[0].nomination_id;
    }

    category_object.winners = cat_winners;
    category_object.nominees = cat_noms;

    outputObject.push(category_object);
  });

  response.json(outputObject);
};

export const updateNomination = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const nomination = request.body;

  try {
    await getRepository(Nomination).update(nomination.id, nomination);
    response.json({msg: 'Success!'});
  } catch(error) {
    console.error(error);
    response.send({msg: 'Error finding nomination: ' + error});
  }
};

export const getMostRecentYear = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const maxYear = await getConnection()
    .createQueryBuilder()
    .select('MAX(n.year) as my')
    .from(Nomination, 'n')
    .getRawOne();

  response.json([{maxYear: maxYear.my}]);
};
