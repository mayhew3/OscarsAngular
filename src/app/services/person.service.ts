import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of, Subject} from 'rxjs';
import {catchError, filter, map, mergeMap, tap} from 'rxjs/operators';
import * as _ from 'underscore';
import {Person} from '../interfaces/Person';
import {ArrayService} from './array.service';
import {Store} from '@ngxs/store';
import {GetPersons} from '../actions/person.action';
import {MyAuthService} from './auth/my-auth.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class PersonService implements OnDestroy {
  personsUrl = 'api/persons';
  private _fetching = false;

  private _destroy$ = new Subject();

  isAdmin: boolean = null;

  persons: Observable<Person[]> = this.store.select(state => state.persons).pipe(
    map(state => state.persons),
    filter(persons => !!persons)
  );

  me$ = this.auth.userEmail$.pipe(
    mergeMap(email => this.getPersonWithEmail(email)),
    filter(person => !!person)
  );

  constructor(private http: HttpClient,
              private arrayService: ArrayService,
              private auth: MyAuthService,
              private store: Store) {
    this._fetching = true;
    this.store.dispatch(new GetPersons());
    this.persons.subscribe(() => this._fetching = false);
    this.me$.subscribe(me => this.isAdmin = (me.role === 'admin'));
  }

  // REAL METHODS

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  getNumberOfCachedPersons(): number {
    return this.store.selectSnapshot(state => state.persons.persons.length);
  }

  isMe(person: Person): Observable<boolean> {
    return this.me$.pipe(
      map(me => me.id === person.id)
    );
  }

  getPersonsForGroup(group_id: number): Observable<Person[]> {
    return this.persons.pipe(
      map(persons => _.filter(persons, person => person.groups.includes(group_id)))
    );
  }

  getPerson(id: number): Observable<Person> {
    return this.persons.pipe(
      map(persons => _.findWhere(persons, {id}))
    );
  }

  getPersonWithEmail(email: string): Observable<Person> {
    return this.persons.pipe(
      map(persons => {
        return _.findWhere(persons, {email});
      })
    );
  }

  stillLoading(): boolean {
    return this._fetching;
  }

  getFullName(person: Person): string {
    if (!!person.middle_name) {
      return person.first_name + ' ' + person.middle_name.charAt(0) + ' ' + person.last_name;
    } else {
      return person.first_name + ' ' + person.last_name;
    }
  }


  // DATA HELPERS

  updatePerson(person: Person): Observable<any> {
    return this.http.put(this.personsUrl, person, httpOptions)
      .pipe(
        catchError(this.handleError<any>('updatePerson', person))
      );
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
