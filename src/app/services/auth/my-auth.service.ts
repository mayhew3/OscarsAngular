/* eslint-disable no-underscore-dangle */
import {Injectable} from '@angular/core';
import {AuthService} from '@auth0/auth0-angular';
import {distinctUntilChanged, filter, first, map} from 'rxjs/operators';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable()
export class MyAuthService {

  isAuthenticated$ = this.auth.isAuthenticated$;
  isLoading$ = this.auth.isLoading$;
  error$ = this.auth.error$;

  failedEmail = false;
  otherFailure = false;
  otherFailureMessage: string;
  private _user$ = new BehaviorSubject<any>(undefined);
  private _user = undefined;

  constructor(private auth: AuthService) {
    this.auth.user$.pipe(
      filter(user => !!user && (!this._user || this._user.email !== user.email))
    ).subscribe(user => {
      this._user = user;
      this.failedEmail = false;
      this.otherFailure = false;
      this._user$.next(this._user);
    });
    this.auth.error$.subscribe((error) => {
      if (error.message === 'No account for email.') {
        this.failedEmail = true;
      } else {
        this.otherFailure = true;
        this.otherFailureMessage = error.message;
      }
    });
  }

  get isPositivelyAuthenticated$(): Observable<boolean> {
    return this.auth.isAuthenticated$.pipe(
      filter(isAuthenticated => !!isAuthenticated),
      first()
    );
  }

  private get user$(): Observable<any> {
    return this._user$.asObservable().pipe(
      filter(user => !!user)
    );
  }

  get userEmail$(): Observable<string> {
    return this.user$.pipe(
      map(user => user.email),
      distinctUntilChanged()
    );
  }

  login(): void {
    this.auth.loginWithRedirect();
  }

  logout(): void {
    this.auth.logout({ returnTo: document.location.origin });
  }

}
