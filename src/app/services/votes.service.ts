import {Injectable} from '@angular/core';
import {Vote} from '../interfaces/Vote';
import {combineLatest, Observable} from 'rxjs';
import {distinctUntilChanged, filter, map, mergeAll, mergeMap, reduce} from 'rxjs/operators';
import {Nominee} from '../interfaces/Nominee';
import {Person} from '../interfaces/Person';
import {SystemVarsService} from './system.vars.service';
import {Category} from '../interfaces/Category';
import * as _ from 'underscore';
import {Store} from '@ngxs/store';
import {GetVotes} from '../actions/votes.action';
import {PersonService} from './person.service';
import {SystemVars} from '../interfaces/SystemVars';
import {ApiService} from './api.service';
import {CategoryService} from './category.service';
import {is} from 'immer/dist/utils/common';

@Injectable({
  providedIn: 'root'
})
export class VotesService {
  votesUrl = '/api/votes';

  votes: Observable<Vote[]> = this.store.select(state => state.votes).pipe(
    map(votesContainer => votesContainer.votes),
    filter(votes => !!votes),
    mergeMap(votes =>
      this.categoryService.categories.pipe(
        map(categories => _.filter(votes, vote => !!_.findWhere(categories, {id: vote.category_id})))
      )
    )
  );

  myVotes$ = combineLatest([this.personService.me$, this.votes]).pipe(
    map(([me, votes]) => _.where(votes, {person_id: me.id}))
  );

  constructor(private systemVarsService: SystemVarsService,
              private personService: PersonService,
              private categoryService: CategoryService,
              private store: Store,
              private api: ApiService) {
    this.systemVarsService.systemVarsCeremonyYearChanges$.subscribe(systemVars => {
      this.store.dispatch(new GetVotes(systemVars.curr_year));
    });
  }

  // SCOREBOARD

  didPersonVoteCorrectlyFor(person: Person, category: Category): Observable<boolean> {
    return this.getVotesForCurrentYearAndCategory(category).pipe(
      map(votes => {
        if (!person) {
          return false;
        }
        const personVote = _.findWhere(votes, {person_id: person.id});
        if (!!personVote) {
          const winningIds = _.map(category.winners, winner => winner.nomination_id);
          return winningIds.includes(personVote.nomination_id);
        }
        return false;
      })
    );
  }

  getVotesForCurrentYearAndCategory(category: Category): Observable<Vote[]> {
    return this.votes.pipe(
      map(votes => _.where(votes, {category_id: category.id}))
    );
  }

  getVotesForCurrentYearAndPerson(person: Person): Observable<Vote[]> {
    return this.votes.pipe(
      map(votes => _.where(votes, {person_id: person.id}))
    );
  }

  getNumCorrectVotesForCurrentYearAndPerson(person: Person): Observable<number> {
    return this.getVotesForCurrentYearAndPerson(person).pipe(
      map(votes => _.map(votes, vote => this.isCorrectVote(person, vote))),
      mergeMap(isCorrectVotes$ => combineLatest(isCorrectVotes$).pipe(
        map((isCorrectVotes: boolean[]) => _.filter(isCorrectVotes, isCorrectVote => !!isCorrectVote).length)
      ))
    );
  }

  isCorrectVote(person: Person, vote: Vote): Observable<boolean> {
    return this.categoryService.getCategory(vote.category_id).pipe(
      mergeMap(category => this.didPersonVoteCorrectlyFor(person, category))
    );
  }

  getMyVoteForCurrentYearAndCategory(category: Category): Observable<Vote> {
    return this.myVotes$.pipe(
      map(votes => {
        const allVotes = _.where(votes, {category_id: category.id});
        return allVotes.length === 1 ? allVotes[0] : undefined;
      })
    );
  }

  getVoteForCurrentYearAndPersonAndCategory(person: Person, category: Category): Observable<Vote> {
    return this.votes.pipe(
      map(votes => {
        if (!person) {
          return undefined;
        }
        const allVotes = _.where(votes, {person_id: person.id, category_id: category.id});
        return allVotes.length === 1 ? allVotes[0] : undefined;
      })
    );
  }

  addOrUpdateVote(nominee: Nominee, person: Person): void {
    const data = {
      category_id: nominee.category_id,
      year: nominee.year,
      person_id: person.id,
      nomination_id: nominee.id,
      submitted: new Date()
    };
    this.api.executePostAfterFullyConnected<Vote>(this.votesUrl, data);
  }

}
