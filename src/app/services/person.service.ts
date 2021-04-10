import {Injectable, OnDestroy} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {filter, map, mergeMap, tap} from 'rxjs/operators';
import * as _ from 'underscore';
import {Person} from '../interfaces/Person';
import {Store} from '@ngxs/store';
import {ChangeOddsView, GetPersons} from '../actions/person.action';
import {MyAuthService} from './auth/my-auth.service';

@Injectable({
  providedIn: 'root'
})
export class PersonService implements OnDestroy {

  isAdmin: boolean = null;
  failedEmail = false;

  me$ = this.auth.userEmail$.pipe(
    mergeMap(email => this.getPersonWithEmail(email)),
    tap(person => this.failedEmail = !person),
    filter(person => !!person)
  );

  persons: Observable<Person[]> = this.store.select(state => state.persons).pipe(
    filter(state => !!state),
    map(state => state.persons),
    filter(persons => !!persons)
  );

  private fetching = false;

  private destroy$ = new Subject();

  constructor(private auth: MyAuthService,
              private store: Store) {
    this.fetching = true;
    this.store.dispatch(new GetPersons());
    this.persons.subscribe(() => this.fetching = false);
    this.me$.subscribe(me => this.isAdmin = (me.role === 'admin'));
  }

  // REAL METHODS

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
      map(persons => _.findWhere(persons, {email}))
    );
  }

  stillLoading(): boolean {
    return this.fetching;
  }

  getFullName(person: Person): string {
    if (!!person.middle_name) {
      return person.first_name + ' ' + person.middle_name.charAt(0) + ' ' + person.last_name;
    } else {
      return person.first_name + ' ' + person.last_name;
    }
  }


  // DATA HELPERS

  updatePerson(person: Person, oddsKey: string): Observable<any> {
    return this.store.dispatch(new ChangeOddsView(person.id, oddsKey));
  }

}
