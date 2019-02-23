import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Vote} from '../interfaces/Vote';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Nominee} from '../interfaces/Nominee';
import {Person} from '../interfaces/Person';
import {SystemVarsService} from './system.vars.service';
import {Category} from '../interfaces/Category';
import {_} from 'underscore';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class VotesService {
  votesUrl = 'api/votes';
  private readonly cache: Vote[];

  constructor(private http: HttpClient,
              private systemVarsService: SystemVarsService) {
    this.cache = [];
    this.systemVarsService.getSystemVars().subscribe(systemVars => {
      this.maybeUpdateCache(systemVars.curr_year).subscribe();
    });
  }

  // HELPERS

  private static addToArray<T>(existingArray: T[], newArray: T[]) {
    existingArray.push.apply(existingArray, newArray);
  }

  getVotesForCurrentYear(): Observable<Vote[]> {
    return new Observable<Vote[]>(observer => {
      this.systemVarsService.getSystemVars().subscribe(systemVars => {
        this.maybeUpdateCache(systemVars.curr_year).subscribe(votes => {
          observer.next(votes);
        });
      });
    });
  }

  getVotesForCurrentYearAndCategory(category: Category): Vote[] {
    return _.where(this.cache, {category_id: category.id});
  }


  private maybeUpdateCache(year: number): Observable<Vote[]> {
    const params = new HttpParams()
      .set('year', year.toString());
    if (this.cache.length === 0) {
      return new Observable<Vote[]>((observer) => {
        this.http.get<Vote[]>(this.votesUrl, {params: params})
          .pipe(
            catchError(this.handleError<Vote[]>('getVotes', []))
          )
          .subscribe(
            (votes: Vote[]) => {
              this.cache.length = 0;
              VotesService.addToArray(this.cache, votes);
              observer.next(votes);
            },
            (err: Error) => observer.error(err)
          );
      });
    } else {
      return of(this.cache);
    }
  }


  addOrUpdateVote(nominee: Nominee, person: Person): Observable<Vote> {
    const data = {
      category_id: nominee.category_id,
      year: nominee.year,
      person_id: person.id,
      nomination_id: nominee.id
    };
    return this.http.post(this.votesUrl, data, httpOptions)
      .pipe(
        catchError(this.handleError<any>('addOrUpdateVote', data))
      );
  }


  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
