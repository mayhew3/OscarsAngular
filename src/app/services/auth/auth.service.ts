import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import * as auth0 from 'auth0-js';
import {_} from 'underscore';
import {environment} from '../../../environments/environment';
import {of, timer} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import {debug} from 'util';

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
  refreshSubscription: any;

  auth0 = new auth0.WebAuth({
    clientID: environment.clientID,
    domain: environment.domain,
    responseType: 'token id_token',
    redirectUri: environment.authCallbackUrl,
    scope: 'openid profile email'
  });


  constructor(public router: Router) {
    this._idToken = '';
    this._accessToken = '';
    this._expiresAt = 0;
    this._userRole = UserRole.Guest;
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

  public isAdmin(): boolean {
    return this.isAuthenticated() && 'scorpy@gmail.com' === this._profile.email;
  }

  public isUser(): boolean {
    return this.isAuthenticated();
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
