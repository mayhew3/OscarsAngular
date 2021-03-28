import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Vote} from '../interfaces/Vote';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Nominee} from '../interfaces/Nominee';
import {Person} from '../interfaces/Person';
import {SystemVarsService} from './system.vars.service';
import {Category} from '../interfaces/Category';
import * as _ from 'underscore';

@Injectable({
  providedIn: 'root'
})
export class VotesServiceStub {

  constructor(private http: HttpClient,
              private systemVarsService: SystemVarsService) {
  }

  get votes(): Observable<Vote[]> {
    return of([]);
  }

  getVotesForCurrentYearAndCategory(category: Category): Vote[] {
    return [];
  }

  addOrUpdateVote(nominee: Nominee, person: Person): Observable<Vote> {
    return of(undefined);
  }

}
