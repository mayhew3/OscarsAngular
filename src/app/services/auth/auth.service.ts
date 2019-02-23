import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import * as auth0 from 'auth0-js';
import {_} from 'underscore';
import {environment} from '../../../environments/environment';
import {Observable, of, Subscriber, timer} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import {Person} from '../../interfaces/Person';
import {PersonService} from '../person.service';

enum UserRole {
  Guest = 'guest',
  User = 'user',
  Admin = 'admin'
}

@Injectable()
export class AuthService {

  private _idToken: string;
  private _accessToken: string;
  private _expiresAt: number;

  private _profile: any;
  private _userRole: UserRole;
  private _person: Person;
  private _loginFailed = false;
  refreshSubscription: any;

  private personObserver: Subscriber<Person>;

  auth0 = new auth0.WebAuth({
    clientID: environment.clientID,
    domain: environment.domain,
    responseType: 'token id_token',
    redirectUri: AuthService.getCallbackUrl(),
    scope: 'openid profile email'
  });

  constructor(public router: Router,
              private personService: PersonService) {
    this._idToken = '';
    this._accessToken = '';
    this._expiresAt = 0;
    this._userRole = UserRole.Guest;
  }

  static getCallbackUrl(): string {
    const protocol = window.location.protocol;
    const path = window.location.hostname;
    const port = window.location.port;
    const portDisplay = port === '' ? '' : ':' + port;
    // noinspection UnnecessaryLocalVariableJS
    const fullPath = protocol + '//' + path + portDisplay + '/callback';
    return fullPath;
  }

  get accessToken(): string {
    return this._accessToken;
  }

  get idToken(): string {
    return this._idToken;
  }

  public login(): void {
    this.auth0.authorize();
  }

  public handleAuthentication(): void {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.localLogin(authResult);
        this.router.navigate(['/']);
      } else if (err) {
        this.router.navigate(['/']);
        console.log(err);
        alert(`Error: ${err.error}. Check the console for further details.`);
      }
    });
  }

  public isMe(person: Person): boolean {
    return this._person && this._person.id === person.id;
  }

  public isAdmin(): boolean {
    return this.isUser() && 'admin' === this._person.role;
  }

  public stillLoading(): boolean {
    return _.isUndefined(this._person) && !this._loginFailed;
  }

  public isUser(): boolean {
    return this.isAuthenticated() && (this._person !== undefined);
  }

  public getFirstName(): string {
    return this._person ? this._person.first_name : undefined;
  }

  public getPerson(): Observable<Person> {
    if (this._person) {
      return of(this._person);
    } else if (localStorage.getItem('isLoggedIn') === 'true') {
      return new Observable<Person>(observer => {
        this.personObserver = observer;
      });
    } else {
      return of(undefined);
    }
  }

  private localLogin(authResult): void {
    // Set isLoggedIn flag in localStorage
    localStorage.setItem('isLoggedIn', 'true');
    // Set the time that the access token will expire at
    const expiresAt = (authResult.expiresIn * 1000) + new Date().getTime();

    this._accessToken = authResult.accessToken;
    this._idToken = authResult.idToken;
    this._expiresAt = expiresAt;

    this.scheduleRenewal();

    // on first login, profile is in payload, but on renewal, need to request it again.
    if (authResult.idTokenPayload.email) {
      this._profile = authResult.idTokenPayload;
      this.personService.getPersonWithEmail(authResult.idTokenPayload.email).subscribe((person) => {
        if (!person) {
          this._loginFailed = true;
        } else {
          this._person = person;
          this._loginFailed = false;
        }
        if (this.personObserver) {
          this.personObserver.next(person);
          this.personObserver = undefined;
        }
      });
    } else {
      throw new Error('No email found in payload.');
    }
  }

  public renewTokens(): void {
    this.auth0.checkSession({}, (err, authResult) => {
       if (authResult && authResult.accessToken && authResult.idToken) {
         this.localLogin(authResult);
       } else if (err) {
         alert(`Could not get a new token (${err.error}: ${err.error_description}).`);
         this.logout();
       }
    });
  }

  public logout(): void {
    // Remove tokens and expiry time
    this._accessToken = '';
    this._idToken = '';
    this._expiresAt = 0;
    this._profile = null;
    this._userRole = UserRole.Guest;
    // Remove isLoggedIn flag from localStorage
    localStorage.removeItem('isLoggedIn');
    this.unscheduleRenewal();
    // Go back to the home route
    this.router.navigate(['/']);
  }

  public isAuthenticated(): boolean {
    // Check whether the current time is past the
    // access token's expiry time
    return new Date().getTime() < this._expiresAt;
  }

  public scheduleRenewal() {
    if (!this.isAuthenticated()) {
      return;
    }
    this.unscheduleRenewal();

    const expiresAt = this._expiresAt;

    const source = of(expiresAt).pipe(mergeMap(inputDate => {
      const now = Date.now();

      // Use the delay in a timer to
      // run the refresh at the proper time
      return timer(Math.max(1, inputDate - now));
    }));

    // Once the delay time from above is
    // reached, get a new JWT and schedule
    // additional refreshes
    this.refreshSubscription = source.subscribe(() => {
      console.log('Token expired. Renewing!');
      this.renewTokens();
      this.scheduleRenewal();
    });
  }

  public unscheduleRenewal() {
    if (!this.refreshSubscription) {
      return;
    }
    console.log('Unscheduling renewal.');
    this.refreshSubscription.unsubscribe();
  }

}
