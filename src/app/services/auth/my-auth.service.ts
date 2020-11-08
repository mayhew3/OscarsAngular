import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {_} from 'underscore';
import {environment} from '../../../environments/environment';
import {Observable, of, Subscriber} from 'rxjs';
import {Person} from '../../interfaces/Person';
import {PersonService} from '../person.service';
import {AuthService} from '@auth0/auth0-angular';
import {concatMap, filter, tap} from 'rxjs/operators';

enum UserRole {
  Guest = 'guest',
  User = 'user',
  Admin = 'admin'
}

@Injectable()
export class MyAuthService {

  private _profile: any;
  private _userRole: UserRole;
  private _person: Person;
  private _loginFailed = false;

  private _failedEmail: string;

  private authenticating = false;

  private personObservers: Subscriber<Person>[] = [];

  me$ = this.auth.user$.pipe(
    filter(user => !!user),
    concatMap((user) => {
      if (!this._person) {
        this.authenticating = false;
        return this.localLogin(user);
      } else {
        return of(this._person);
      }
    })
  );

  constructor(public router: Router,
              private personService: PersonService,
              private auth: AuthService) {
    this._userRole = UserRole.Guest;
    this.personService.maybeUpdateCache();
  }

  static getCallbackUrl(): string {
    return this.getLogoutUrl() + '/callback';
  }

  static getLogoutUrl(): string {
    const protocol = window.location.protocol;
    const path = window.location.hostname;
    const port = window.location.port;
    const portDisplay = port === '' ? '' : ':' + port;
    // noinspection UnnecessaryLocalVariableJS
    const fullPath = protocol + '//' + path + portDisplay;
    return fullPath;
  }

  public login(): void {
    this.authenticating = true;
    this.auth.loginWithRedirect({
      redirect_uri: MyAuthService.getCallbackUrl()
    });
  }

  public isMe(person: Person): boolean {
    return this._person && this._person.id === person.id;
  }

  public isAdmin(): boolean {
    return this.isUser() && 'admin' === this._person.role;
  }

  public getFailedEmail(): string {
    return this._failedEmail;
  }

  public isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  public stillLoading(): boolean {
    return this.authenticating;
  }

  public isUser(): boolean {
    return this.isAuthenticated();
  }

  public getFirstName(): string {
    return !!this._person ? this._person.first_name : undefined;
  }

  public getPersonID(): number {
    return !!this._person ? this._person.id : undefined;
  }

  public isProductionMode(): boolean {
    return environment.production;
  }

  public getPerson(): Observable<Person> {
    if (!!this._person) {
      return of(this._person);
    } else {
      return new Observable<Person>(observer => {
        this.personObservers.push(observer);
      });
    }
  }

  public getPersonNow(): Person {
    return this._person;
  }

  private localLogin(user): Observable<Person> {
    return new Observable<Person>(observer => {
      if (user.email) {
        this._profile = user;
        this.personService.getPersonWithEmail(user.email).subscribe((person) => {
          if (!person) {
            this._loginFailed = true;
            this._failedEmail = user.email;
          } else {
            this._person = person;
            this._loginFailed = false;
          }
          for (const callback of this.personObservers) {
            callback.next(person);
          }
          this.personObservers = [];
          observer.next(person);
        });
      } else {
        throw new Error('No email found in payload.');
      }
    });
  }

  public logout(): void {
    this.auth.logout({returnTo: MyAuthService.getLogoutUrl()});
    this._profile = null;
    this._person = null;
    this._userRole = UserRole.Guest;
    // Remove isLoggedIn flag from localStorage
    // Go back to the home route
    this.router.navigate(['/']);
  }

  public isAuthenticated(): boolean {
    return !!this._person && !this._failedEmail;
  }

  public listenForLogin(callback) {
    this.personObservers.push(callback);
  }
}
