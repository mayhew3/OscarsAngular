import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Vote} from '../interfaces/Vote';
import {Observable, of} from 'rxjs';
import {catchError, filter, first, map, tap} from 'rxjs/operators';
import {Nominee} from '../interfaces/Nominee';
import {Person} from '../interfaces/Person';
import {SystemVarsService} from './system.vars.service';
import {Category} from '../interfaces/Category';
import * as _ from 'underscore';
import {ArrayUtil} from '../utility/ArrayUtil';
import {Store} from '@ngxs/store';
import {GetVotes} from '../actions/votes.action';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class VotesService {
  votesUrl = 'api/votes';
  isLoading = true;
  private readonly cache: Vote[];

  votes: Observable<Vote[]>;

  constructor(private http: HttpClient,
              private systemVarsService: SystemVarsService,
              private store: Store) {
    this.cache = [];
    this.systemVarsService.systemVars
      .pipe(first())
      .subscribe(systemVars => this.store.dispatch(new GetVotes(systemVars.curr_year)));
    this.votes = this.store.select(state => state.oscars).pipe(
      map(state => state.votes),
      filter(votes => !!votes),
      tap(() => {
        this.isLoading = false;
      })
    );
  }

  stillLoading(): boolean {
    return this.isLoading;
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

  getVotesForCurrentYearAndPersonAndCategory(person: Person, category: Category): Observable<Vote> {
    return this.votes.pipe(
      map(votes => {
        const allVotes = _.where(votes, {person_id: person.id, category_id: category.id});
        return allVotes.length === 1 ? allVotes[0] : undefined;
      })
    );
  }

  private maybeUpdateCache(year: number): Observable<Vote[]> {
    if (this.cache.length === 0) {
      return this.refreshCache(year);
    } else {
      return of(this.cache);
    }
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

  addOrUpdateVote(nominee: Nominee, person: Person): Observable<Vote> {
    return new Observable<Vote>(observer => {
      const data = {
        category_id: nominee.category_id,
        year: nominee.year,
        person_id: person.id,
        nomination_id: nominee.id
      };
      this.http.post(this.votesUrl, data, httpOptions)
        .pipe(
          catchError(this.handleError<any>('addOrUpdateVote', data))
        )
        .subscribe(vote => {
          const existingVote = _.findWhere(this.cache, {id: vote.id});
          if (!!existingVote) {
            existingVote.nomination_id = nominee.id;
          } else {
            this.cache.push(vote);
          }
          observer.next(vote);
        });
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
