import {Injectable} from '@angular/core';
import {Person} from '../../interfaces/Person';
import {TestPersonList} from '../data/persons.test.mock';
import {Observable, of} from 'rxjs';

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

  public getFirstName(): string {
    return undefined;
  }

  get me$(): Observable<Person> {
    return this.getPerson();
  }

  public getPerson(): Observable<Person> {
    return of(TestPersonList[0]);
  }

  public isUser(): boolean {
    return true;
  }

  public isAdmin(): boolean {
    return true;
  }

  public isAuthenticated(): boolean {
    return true;
  }

  public scheduleRenewal(): void {

  }

}
