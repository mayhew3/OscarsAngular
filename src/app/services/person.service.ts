import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable, of, ReplaySubject, Subject} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import * as _ from 'underscore';
import {Person} from '../interfaces/Person';
import {ArrayService} from './array.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class PersonService implements OnDestroy {
  personsUrl = 'api/persons';
  private _persons$ = new ReplaySubject<Person[]>(1);
  private _dataStore: {persons: Person[]} = {persons: []};
  private _fetching = false;

  private _destroy$ = new Subject();

  constructor(private http: HttpClient,
              private arrayService: ArrayService) {
  }

  // REAL METHODS

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  get persons(): Observable<Person[]> {
    return this._persons$.asObservable();
  }

  getNumberOfCachedPersons(): number {
    return this._dataStore.persons.length;
  }

  maybeUpdateCache(): void {
    if (this._dataStore.persons.length === 0 && !this._fetching) {
      this._fetching = true;
      this.refreshCache();
    }
  }

  getPersonsForGroup(group_id: number): Observable<Person[]> {
    return this.persons.pipe(
      map(persons => _.filter(persons, person => person.groups.includes(group_id)))
    );
  }

  getPerson(id: number): Observable<Person> {
    return this.persons.pipe(
      map(persons => _.findWhere(persons, {id: id}))
    );
  }

  getPersonWithEmail(email: string): Observable<Person> {
    return this.persons.pipe(
      map(persons => {
        return _.findWhere(persons, {email: email});
      })
    );
  }

  stillLoading(): boolean {
    return this._dataStore.persons.length === 0;
  }

  getPersonFromCache(id: number): Person {
    return _.findWhere(this._dataStore.persons, {id: id});
  }

  hasDuplicateFirstName(person: Person): boolean {
    const matching = _.filter(this._dataStore.persons, otherPerson => otherPerson.id !== person.id &&
      otherPerson.first_name === person.first_name);
    return matching.length > 0;
  }

  hasDuplicateFirstAndLastName(person: Person): boolean {
    const matching = _.filter(this._dataStore.persons, otherPerson => otherPerson.id !== person.id &&
      otherPerson.first_name === person.first_name &&
      otherPerson.last_name === person.last_name);
    return matching.length > 0;
  }

  getFullName(person: Person): string {
    if (!!person.middle_name) {
      return person.first_name + ' ' + person.middle_name.charAt(0) + ' ' + person.last_name;
    } else {
      return person.first_name + ' ' + person.last_name;
    }
  }


  // DATA HELPERS

  private refreshCache(): void {
    this.http.get<Person[]>(this.personsUrl)
      .pipe(
        catchError(this.handleError<Person[]>('getPersons', []))
      )
      .subscribe(
        (persons: Person[]) => {
          this._dataStore.persons = persons;
          this.pushPersonListChange();
        }
      );
  }

  updatePerson(person: Person): Observable<any> {
    return this.http.put(this.personsUrl, person, httpOptions)
      .pipe(
        catchError(this.handleError<any>('updatePerson', person))
      );
  }

  private pushPersonListChange() {
    this._persons$.next(this.arrayService.cloneArray(this._dataStore.persons));
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
