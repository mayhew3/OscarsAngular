import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Vote} from '../interfaces/Vote';
import {combineLatest, Observable, of} from 'rxjs';
import {catchError, distinctUntilChanged, filter, first, map, tap} from 'rxjs/operators';
import {Nominee} from '../interfaces/Nominee';
import {Person} from '../interfaces/Person';
import {SystemVarsService} from './system.vars.service';
import {Category} from '../interfaces/Category';
import * as _ from 'underscore';
import {ArrayUtil} from '../utility/ArrayUtil';
import {Store} from '@ngxs/store';
import {AddVote, ChangeVote, GetVotes} from '../actions/votes.action';
import {PersonService} from './person.service';
import {CategoryService} from './category.service';
import {Winner} from '../interfaces/Winner';
import {SystemVars} from '../interfaces/SystemVars';

@Injectable({
  providedIn: 'root'
})
export class VotesService {
  votesUrl = 'api/votes';
  isLoading = true;
  private readonly cache: Vote[];

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

  constructor(private http: HttpClient,
              private systemVarsService: SystemVarsService,
              private personService: PersonService,
              private categoryService: CategoryService,
              private store: Store) {
    this.cache = [];
    this.systemVarsService.systemVars.pipe(
      distinctUntilChanged((sv1: SystemVars, sv2: SystemVars) => sv1.curr_year === sv2.curr_year)
    ).subscribe(systemVars => this.store.dispatch(new GetVotes(systemVars.curr_year)));

    const persons$ = this.personService.persons;
    const categories$ = this.categoryService.categories;

    combineLatest([persons$, categories$, this.votes])
      .subscribe(([persons, categories, votes]) => {
        this.updatePersonScores(persons, categories, votes);
      });
  }

  stillLoading(): boolean {
    return this.isLoading;
  }

  private updatePersonScores(persons: Person[], categories: Category[], votes: Vote[]): void {
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
            const existingWinner = this.getWinnerForNominee(category, personVote.nomination_id);
            if (!!existingWinner) {
              score += category.points;
            }
          }
        }
      });
      person.score = score;
      person.num_votes = numVotes;
    });
  }

  // noinspection JSMethodCanBeStatic
  private getWinnerForNominee(category: Category, nomination_id: number): Winner {
    return _.findWhere(category.winners, {nomination_id});
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

  maxPosition(person: Person, persons: Person[]): Observable<number> {
    return combineLatest([this.categoryService.categories, this.votes]).pipe(
      map(([categories, votes]) => {
        const categoriesWithoutWinners = _.filter(categories, category => !category.winners || category.winners.length === 0);
        const myVotes = _.map(categoriesWithoutWinners, category => {
          const allVotes = _.where(votes, {person_id: person.id, category_id: category.id});
          return allVotes.length === 1 ? allVotes[0] : undefined;
        });
        const finalScores = _.map(persons, (otherPerson: Person) => {
          const theirVotes: Vote[] = _.where(votes, {person_id: otherPerson.id});
          const theirVotesThatMatch = _.filter(theirVotes, (vote: Vote) => {
            const myVote = _.findWhere(myVotes, {category_id: vote.category_id});
            return !!myVote && myVote.nomination_id === vote.nomination_id;
          });
          const theirScore = _.reduce(theirVotesThatMatch, (memo: number, theirVote: Vote) => {
            const category = _.findWhere(categories, {id: theirVote.category_id});
            return !!category ? memo + category.points : memo;
          }, 0);
          return {
            person_id: otherPerson.id,
            score: theirScore + otherPerson.score
          };
        });

        const myScore = _.findWhere(finalScores, {person_id: person.id});
        const scoresBetterThanMine = _.filter(finalScores, otherScore => otherScore.score > myScore.score);
        return scoresBetterThanMine.length + 1;
      })
    );
  }

  isEliminated(person: Person, persons: Person[]): Observable<boolean> {
    return this.maxPosition(person, persons).pipe(
      map(maxPosition => maxPosition > 1)
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

  refreshCacheForThisYear(): Observable<Vote[]> {
    return new Observable<Vote[]>(observer => {
      this.systemVarsService.systemVars.subscribe(systemVars => {
        this.refreshCache(systemVars.curr_year).subscribe(votes => observer.next(votes));
      });
    });
  }

  refreshCache(year: number): Observable<Vote[]> {
    const params = new HttpParams()
      .set('year', year.toString());
    return new Observable<Vote[]>((observer) => {
      this.http.get<Vote[]>(this.votesUrl, {params})
        .pipe(
          catchError(this.handleError<Vote[]>('getVotes', []))
        )
        .subscribe(
          (votes: Vote[]) => {
            this.cache.length = 0;
            ArrayUtil.addToArray(this.cache, votes);
            observer.next(votes);
          },
          (err: Error) => observer.error(err)
        );
    });
  }

  addOrUpdateVote(nominee: Nominee, person: Person): Observable<any> {
    return new Observable<any>(observer => {
      this.votes.pipe(first())
        .subscribe(votes => {
            const existing = _.findWhere(votes, {
              category_id: nominee.category_id,
              year: nominee.year,
              person_id: person.id
            });
            if (!existing) {
              this.store.dispatch(new AddVote(nominee.category_id, nominee.year, person.id, nominee.id, new Date()))
                .subscribe(() => observer.next());
            } else {
              this.store.dispatch(new ChangeVote(nominee.category_id, nominee.year, person.id, nominee.id, new Date()))
                .subscribe(() => observer.next());
            }
          }
        );
    });
  }


  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T): (obs: Observable<T>) => Observable<T> {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
