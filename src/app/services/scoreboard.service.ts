import { Injectable } from '@angular/core';
import {ScoreData} from '../interfaces/ScoreData';
import {PersonService} from './person.service';
import {CategoryService} from './category.service';
import {VotesService} from './votes.service';
import {OddsService} from './odds.service';
import {SocketService} from './socket.service';
import {combineLatest} from 'rxjs';
import {ArrayUtil} from '../utility/ArrayUtil';
import * as _ from 'underscore';
import {Person} from '../interfaces/Person';
import {Category} from '../interfaces/Category';
import {Vote} from '../interfaces/Vote';
import fast_sort from 'fast-sort';

@Injectable({
  providedIn: 'root'
})
export class ScoreboardService {

  scoreData: ScoreData[] = [];
  me: Person;

  constructor(private personService: PersonService,
              private categoryService: CategoryService,
              private voteService: VotesService,
              private oddsService: OddsService) {

    this.personService.me$.subscribe(person => {
      this.me = person;
    });

    this.initScoreData();
  }


  initScoreData(): void {
    combineLatest([
      this.categoryService.categories,
      this.voteService.votes,
      this.personService.getPersonsForGroup(1),
      this.oddsService.odds$,
      this.oddsService.previousOdds$,
    ])
      .subscribe(([categories, votes, persons, oddsBundle, previousOddsBundle]) => {
        ArrayUtil.emptyArray(this.scoreData);
        _.forEach(persons, person => {
          let score = 0;
          let numVotes = 0;
          _.forEach(categories, category => {
            const personVote = _.findWhere(votes, {
              person_id: person.id,
              category_id: category.id
            });
            if (personVote) {
              numVotes++;
              if (category.winners.length > 0) {
                const existingWinner = _.findWhere(category.winners, {nomination_id: personVote.nomination_id});
                if (!!existingWinner) {
                  score += category.points;
                }
              }
            }
          });

          const odds = _.find(oddsBundle.odds, o => o.person_id === person.id);
          const previousOdds = !previousOddsBundle ? undefined : _.find(previousOddsBundle.odds, o => o.person_id === person.id);
          this.scoreData.push(new ScoreData(person, score, numVotes, odds, previousOdds));
        });
        _.each(this.scoreData, sd => {
          sd.maxPosition = this.maxPosition(sd.person, categories, votes);
        });
        this.fastSortPersons();
      });
  }

  getVoters(): ScoreData[] {
    // noinspection TypeScriptValidateJSTypes
    return _.filter(this.scoreData, scoreData => !!scoreData.num_votes);
  }

  getPlayersInFirstPlaceFullNames(): string[] {
    const winners = this.getPlayersInFirstPlace();
    return _.map(winners, winner => this.personService.getFullName(winner.person));
  }

  getPlayersInFirstPlace(): ScoreData[] {
    return _.filter(this.scoreData, scoreData => !this.anyoneIsHigherInRankings(scoreData));
  }

  anyoneIsHigherInRankings(scoreData: ScoreData): boolean {
    const myScore = scoreData.score;
    return this.allScores.filter(otherPerson => otherPerson.score > myScore).length > 0;
  }

  get allScores(): ScoreData[] {
    return Array.from(this.scoreData.values());
  }


  fastSortPersons(): void {
    fast_sort(this.scoreData)
      .by([
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        { desc: (scoreData: ScoreData) => scoreData.score},
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        { desc: (scoreData: ScoreData) => this.getSortingOddsForPerson(scoreData)},
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        { desc: (scoreData: ScoreData) => this.isMe(scoreData.person)},
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        { asc: (scoreData: ScoreData) => scoreData.person.first_name},
      ]);
  }

  isMe(person: Person): boolean {
    return !!this.me && person.id === this.me.id;
  }

  getSortingOddsForPerson(scoreData: ScoreData): number {
    const numericOdds = this.getNumericOddsForPerson(scoreData);
    try {
      if (numericOdds === undefined) {
        return -1;
      } else {
        return numericOdds;
      }
    } catch (err) {
      return -1;
    }
  }

  getNumericOddsForPerson(scoreData: ScoreData): number {
    const isEliminated = this.isEliminated(scoreData);
    if (isEliminated && !this.shouldHideElimination()) {
      return 0.0;
    }

    const oddsForPerson = scoreData.odds;
    if (!oddsForPerson || !oddsForPerson.odds || oddsForPerson.odds === 0) {
      return 0.001;
    }
    if (!!oddsForPerson.clinched && !this.shouldHideElimination()) {
      return 100.0;
    }
    const oddsValue = oddsForPerson.odds * 100;
    if (!oddsValue) {
      const notOdds = !oddsForPerson;
      throw new Error('Invalid float value: ' + oddsForPerson.odds + ', oddsValue: ' + oddsValue + ', notOdds: ' + notOdds);
    } else if (oddsValue === 100.0) {
      return 99.9;
    } else {
      return oddsValue;
    }
  }

  shouldHideElimination(): boolean {
    return !!this.me && this.me.odds_filter === 'hideElimination';
  }

  isEliminated(scoreData: ScoreData): boolean {
    return scoreData.maxPosition > 1;
  }

  maxPosition(person: Person, categories: Category[], votes: Vote[]): number {
    const categoriesWithoutWinners = _.filter(categories, category => !category.winners || category.winners.length === 0);
    const myVotes = _.map(categoriesWithoutWinners, category => {
      const allVotes = _.where(votes, {person_id: person.id, category_id: category.id});
      return allVotes.length === 1 ? allVotes[0] : undefined;
    });
    const finalScores = _.map(this.scoreData, (otherPersonData: ScoreData) => {
      const theirVotes: Vote[] = _.where(votes, {person_id: otherPersonData.person.id});
      const theirVotesThatMatch = _.filter(theirVotes, (vote: Vote) => {
        const myVote = _.findWhere(myVotes, {category_id: vote.category_id});
        return !!myVote && myVote.nomination_id === vote.nomination_id;
      });
      const theirScore = _.reduce(theirVotesThatMatch, (memo: number, theirVote: Vote) => {
        const category = _.findWhere(categories, {id: theirVote.category_id});
        return !!category ? memo + category.points : memo;
      }, 0);
      return {
        person_id: otherPersonData.person.id,
        score: theirScore + otherPersonData.score
      };
    });

    const myScore = _.findWhere(finalScores, {person_id: person.id});
    const scoresBetterThanMine = _.filter(finalScores, otherScore => otherScore.score > myScore.score);
    return scoresBetterThanMine.length + 1;
  }

}
