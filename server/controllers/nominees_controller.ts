import _ from 'underscore';
import {getConnection, getRepository} from 'typeorm';
import {Nomination} from '../typeorm/Nomination';
import {Category} from '../typeorm/Category';
import {Vote} from '../typeorm/Vote';
import {Winner} from '../typeorm/Winner';
import {Category as CategoryObj} from '../../src/app/interfaces/Category';
import {NextFunction, Request, Response} from 'express/ts4.0';
import {SystemVars} from '../typeorm/SystemVars';
import {CeremonyYear} from '../typeorm/CeremonyYear';

export const getCategories = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  if (!request.query.year) {
    return next(new Error('No year attached to request!'));
  }
  if (!request.query.person_id) {
    return next(new Error('No person_id attached to request!'));
  }

  const systemVarsArray = await getRepository(SystemVars).find();
  if (systemVarsArray.length !== 1) {
    throw new Error('Expected exactly one row in system_vars!');
  }
  const systemVars = systemVarsArray[0];

  const ceremonyYear = await getRepository(CeremonyYear).findOne(systemVars.ceremony_year_id);
  if (!ceremonyYear) {
    throw new Error('No ceremonyYear found with id: ' + systemVars.ceremony_year_id);
  }

  const categories = await getRepository(Category).find({
    where: {
      ceremony_id: ceremonyYear.ceremony_id
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
  const outputObject: CategoryObj[] = [];

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
      return next(new Error('Multiple votes found for category ' + category.id));
    }

    const category_object: CategoryObj = JSON.parse(JSON.stringify(category));

    if (cat_votes.length > 0) {
      category_object.voted_on = cat_votes[0].nomination_id;
    }

    category_object.winners = cat_winners;
    category_object.nominees = cat_noms;

    outputObject.push(category_object);
  });

  response.json(outputObject);
};

export const updateNomination = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  const nomination = request.body;

  try {
    await getRepository(Nomination).update(nomination.id, nomination);
    response.json({msg: 'Success!'});
  } catch(error) {
    next(error);
  }
};

export const getMostRecentYear = async (request: Request, response: Response): Promise<void> => {
  const maxYear = await getConnection()
    .createQueryBuilder()
    .select('MAX(n.year) as my')
    .from(Nomination, 'n')
    .getRawOne();

  response.json([{maxYear: maxYear.my}]);
};
