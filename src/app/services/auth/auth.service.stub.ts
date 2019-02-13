import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import * as auth0 from 'auth0-js';
import {environment} from '../../../environments/environment';

@Injectable()
export class AuthServiceStub {


  get accessToken(): string {
    return '';
  }

  get idToken(): string {
    return '';
  }

  public login(): void {
  }

  public handleAuthentication(): void {

  }

  public renewTokens(): void {

  }

  public logout(): void {

  }

  public isAuthenticated(): boolean {
    return true;
  }

}
