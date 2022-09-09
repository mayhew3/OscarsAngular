import _ from 'underscore';
import {getRepository} from 'typeorm';
import {GroupYear} from '../typeorm/GroupYear';
import {FinalResult as FinalResultObj} from '../../src/app/interfaces/FinalResult';
import {Request, Response} from 'express/ts4.0';
import {Vote} from '../typeorm/Vote';
import {Category} from '../typeorm/Category';
import {CeremonyYear} from '../typeorm/CeremonyYear';
import {Person} from '../typeorm/Person';
import {PersonGroupRole} from '../typeorm/PersonGroupRole';
import {Winner} from '../typeorm/Winner';
import {SystemVars} from '../typeorm/SystemVars';

export const getFinalResults = async (request: Request, response: Response): Promise<void> => {

  const groupYears = await getRepository(GroupYear).find();
  const votes = await getRepository(Vote).find();
  const categories = await getRepository(Category).find();
  const ceremonyYears = await getRepository(CeremonyYear).find();
  const persons = await getRepository(Person).find();
  const personGroupRoles = await getRepository(PersonGroupRole).find();
  const winners = await getRepository(Winner).find();
  const systemVarsArray = await getRepository(SystemVars).find();

  if (systemVarsArray.length !== 1) {
    throw new Error('Expected exactly one row in system_vars!');
  }
  const systemVars = systemVarsArray[0];
  const activeCeremonyYearId = systemVars.ceremony_year_id;

  const hasAnyVotes = (person_id: number, year: number, ceremony_id: number): boolean => {
    const myVotes = _.where(votes, {year, person_id});
    const filtered = _.filter(myVotes, vote => {
      const category = _.findWhere(categories, {id: vote.category_id});
      if (!category) {
        throw new Error('No category found with id: ' + vote.category_id);
      } else {
        return category.ceremony_id === ceremony_id;
      }
    });
    return filtered.length > 0;
  };

  const calculateScore = (result: Partial<FinalResultObj>, person: Person, year: number, groupWinners: Winner[]): FinalResultObj => {
    result.score = 0;
    result.correct_count = 0;
    for (const winner of groupWinners) {
      const category = _.findWhere(categories, {id: winner.category_id});
      if (!category) {
        throw new Error('No category found with id: ' + winner.category_id);
      }
      const existingVote = _.findWhere(votes, {year, person_id: person.id, category_id: category.id});
      if (!!existingVote && existingVote.nomination_id === winner.nomination_id) {
        result.score += category.points;
        result.correct_count++;
      }
    }
    return result as FinalResultObj;
  };

  const outputObject: FinalResultObj[] = [];

  const hasResultAlready = (person: Person, groupYear: GroupYear): boolean => {
    const existing = _.findWhere(outputObject, {person_id: person.id, group_year_id: groupYear.id});
    return !!existing;
  };

  for (const groupYear of groupYears) {
    const ceremonyYear = _.findWhere(ceremonyYears, {id: groupYear.ceremony_year_id});
    if (!ceremonyYear) {
      throw new Error('No ceremony_year found with id: ' + groupYear.ceremony_year_id);
    }

    if (activeCeremonyYearId !== ceremonyYear.id) {

      const year = ceremonyYear.year;
      const ceremony_id = ceremonyYear.ceremony_id;
      const groupWinners = _.filter(winners, winner => {
        const category = _.findWhere(categories, {id: winner.category_id});
        if (!category) {
          throw new Error('No category found with id: ' + winner.category_id);
        }
        return winner.year === year && category.ceremony_id === ceremony_id;
      });

      if (groupWinners.length > 0) {

        const groupPersons = _.chain(personGroupRoles)
          .filter(role => role.person_group_id === groupYear.person_group_id && hasAnyVotes(role.person_id, year, ceremony_id))
          .map(role => _.findWhere(persons, {id: role.person_id}))
          .filter(person => !!person)
          .value() as Person[];

        for (const person of groupPersons) {
          if (!hasResultAlready(person, groupYear)) {
            const result: Partial<FinalResultObj> = {
              group_id: groupYear.person_group_id,
              year: groupYear.year,
              person_id: person.id,
              ceremony_id
            };
            const finishedResult = calculateScore(result, person, year, groupWinners);
            outputObject.push(finishedResult);
          }
        }

        let newResults = 0;
        for (const finalResult of outputObject) {
          const resultsWithMore = _.filter(outputObject, obj => obj.score > finalResult.score &&
            obj.group_id === finalResult.group_id &&
            obj.year === finalResult.year &&
            obj.ceremony_id === finalResult.ceremony_id
          );
          finalResult.rank = resultsWithMore.length + 1;
          newResults++;
        }
      }
    }

  }

  response.json(outputObject);
};
