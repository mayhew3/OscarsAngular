import {Injectable} from '@angular/core';
import {Vote} from '../interfaces/Vote';
import {combineLatest, Observable} from 'rxjs';
import {distinctUntilChanged, filter, map, tap} from 'rxjs/operators';
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

@Injectable({
  providedIn: 'root'
})
export class VotesService {
  votesUrl = '/api/votes';
  isLoading = true;

  votes: Observable<Vote[]> = this.store.select(state => state.votes).pipe(
    map(votesContainer => votesContainer.votes),
    filter(votes => !!votes),
    tap(() => {
      this.isLoading = false;
    })
  );

  myVotes$ = combineLatest([this.personService.me$, this.votes]).pipe(
    map(([me, votes]) => _.where(votes, {person_id: me.id}))
  );

  constructor(private systemVarsService: SystemVarsService,
              private personService: PersonService,
              private store: Store,
              private api: ApiService) {
    this.systemVarsService.systemVars.pipe(
      distinctUntilChanged((sv1: SystemVars, sv2: SystemVars) => sv1.curr_year === sv2.curr_year)
    ).subscribe(systemVars => {
      this.store.dispatch(new GetVotes(systemVars.curr_year));
    });
  }

  stillLoading(): boolean {
    return this.isLoading;
  }

  // SCOREBOARD

  didPersonVoteCorrectlyFor(person: Person, category: Category): Observable<boolean> {
    return this.getVotesForCurrentYearAndCategory(category).pipe(
      map(votes => {
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
