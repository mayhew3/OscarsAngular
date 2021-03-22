import {Injectable} from '@angular/core';
import {AuthService} from '@auth0/auth0-angular';
import {distinctUntilChanged, filter, map} from 'rxjs/operators';
import {BehaviorSubject, Observable} from 'rxjs';

enum UserRole {
  Guest = 'guest',
  User = 'user',
  Admin = 'admin'
}

@Injectable()
export class MyAuthService {

  private _failedEmail = false;
  private _otherFailure = false;
  private _otherFailureMessage: string;
  isAuthenticated$ = this.auth.isAuthenticated$;
  isLoading$ = this.auth.isLoading$;

  private _user$ = new BehaviorSubject<any>(undefined);
  private _user = undefined;

  constructor(private auth: AuthService) {
    this.auth.user$.pipe(
      filter(user => !!user && (!this._user || this._user.email !== user.email))
    ).subscribe(user => {
      this._user = user;
      this._failedEmail = false;
      this._otherFailure = false;
      this._user$.next(this._user);
    });
    this.auth.error$.subscribe((error) => {
      if (error.message === 'No account for email.') {
        this._failedEmail = true;
      } else {
        this._otherFailure = true;
        this._otherFailureMessage = error.message;
      }
    });
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

  get failedEmail(): boolean {
    return this._failedEmail;
  }

  get otherFailure(): boolean {
    return this._otherFailure;
  }

  get otherFailureMessage(): string {
    return this._otherFailureMessage;
  }

}
