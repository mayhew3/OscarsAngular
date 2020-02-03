import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {SystemVars} from '../interfaces/SystemVars';

@Injectable({
  providedIn: 'root'
})
export class SystemVarsServiceStub {
  getSystemVars(): Observable<SystemVars> {
    return of({
      curr_year: 2018,
      voting_open: true
    });
  }

  public canVote(): boolean {
    return true;
  }

  public stillLoading(): boolean {
    return false;
  }

}
