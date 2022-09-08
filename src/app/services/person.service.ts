import {Injectable} from '@angular/core';
import {first, Observable} from 'rxjs';
import {filter, map, mergeMap, tap} from 'rxjs/operators';
import * as _ from 'underscore';
import {Person} from '../interfaces/Person';
import {Store} from '@ngxs/store';
import {ChangeOddsView, GetPersons} from '../actions/person.action';
import {MyAuthService} from './auth/my-auth.service';
import {ApiService} from './api.service';
import {GetPersonGroups} from '../actions/person.group.action';
import {PersonGroup} from '../interfaces/PersonGroup';
import {SocketService} from './socket.service';
import {PersonNotificationService} from './person-notification.service';

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  isAdmin: boolean = null;
  failedEmail = false;

  me$ = this.auth.userEmail$.pipe(
    mergeMap(email => this.getPersonWithEmail(email)),
    tap(person => this.failedEmail = !person),
    filter(Boolean)
  );

  persons: Observable<Person[]> = this.store.select(state => state.persons).pipe(
    filter(Boolean),
    map(state => state.persons),
    filter(Boolean)
  );

  personGroups: Observable<PersonGroup[]> = this.store.select(state => state.persons).pipe(
    filter(Boolean),
    map(state => state.personGroups),
    filter(Boolean)
  );

  constructor(private auth: MyAuthService,
              private store: Store,
              private socket: SocketService,
              private apiService: ApiService,
              private personNotificationService: PersonNotificationService) {
    this.store.dispatch(new GetPersons());
    this.store.dispatch(new GetPersonGroups());
    this.me$.subscribe(me => {
      this.isAdmin = (me.role === 'admin');
      this.apiService.meChanged(me);
    });

    this.socket.on('person_connected', msg => {
      this.showPersonSnackBar(msg.person_id, true);
    });

    this.socket.on('person_disconnected', msg => {
      this.showPersonSnackBar(msg.person_id, false);
    });
  }

  // REAL METHODS

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

  getFullName(person: Person): string {
    if (!!person.middle_name) {
      return person.first_name + ' ' + person.middle_name.charAt(0) + ' ' + person.last_name;
    } else {
      return person.first_name + ' ' + person.last_name;
    }
  }

  getPersonName(person: Person): Observable<string> {
    return this.persons.pipe(
      map(persons => {
        if (this.hasDuplicateFirstName(person, persons)) {
          if (this.hasDuplicateFirstAndLastName(person, persons)) {
            if (!!person.middle_name) {
              return person.first_name + ' ' + person.middle_name.charAt(0);
            } else {
              return person.first_name + ' ' + person.last_name.charAt(0);
            }
          } else {
            return person.first_name + ' ' + person.last_name.charAt(0);
          }
        } else {
          return person.first_name;
        }
      })
    );
  }

  hasDuplicateFirstName(person: Person, persons: Person[]): boolean {
    const matching = _.filter(persons, otherPerson => otherPerson.id !== person.id &&
      otherPerson.first_name === person.first_name);
    return matching.length > 0;
  }

  hasDuplicateFirstAndLastName(person: Person, persons: Person[]): boolean {
    const matching = _.filter(persons, otherPerson => otherPerson.id !== person.id &&
      otherPerson.first_name === person.first_name &&
      otherPerson.last_name === person.last_name);
    return matching.length > 0;
  }

  private showPersonSnackBar(person_id: number, connected: boolean): void {
    this.getPerson(person_id).pipe(first())
      .subscribe(person => {
        this.personNotificationService.showPersonSnackbar(person, connected);
      });
  }


  // DATA HELPERS

  updatePerson(person: Person, oddsKey: string): Observable<any> {
    return this.store.dispatch(new ChangeOddsView(person.id, oddsKey));
  }

}
