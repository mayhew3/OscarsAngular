import {Component, OnInit} from '@angular/core';
import {SystemVarsService} from '../../services/system.vars.service';
import {CategoryService} from '../../services/category.service';
import {VotesService} from '../../services/votes.service';
import {MyAuthService} from '../../services/auth/my-auth.service';
import {concatMap, map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {PersonService} from '../../services/person.service';

@Component({
  selector: 'osc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(public auth: MyAuthService,
              public personService: PersonService,
              public systemVarsService: SystemVarsService,
              public categoryService: CategoryService,
              public votesService: VotesService) {
    this.systemVarsService.maybeRefreshCache();
    this.categoryService.maybeRefreshCache();
  }

  ngOnInit() {
  }

  categoryCount(): number {
    return this.categoryService.getCategoryCountNow();
  }

  getFailedEmail(): boolean {
    return this.auth.failedEmail;
  }

  numVotesRemaining(): Observable<number> {
    return this.personService.me$.pipe(
      concatMap(me => this.votesService.getVotesForCurrentYearAndPerson(me)),
      map(votes => !!this.categoryCount() ? this.categoryCount() - votes.length : 0)
    );
  }

  getOscarYear(): number {
    return this.systemVarsService.getCurrentYear();
  }

  isLoggedIn(): Observable<boolean> {
    return this.auth.isAuthenticated$;
  }

  stillLoading(): boolean {
    return this.personService.stillLoading() ||
      this.systemVarsService.stillLoading();
  }

  stillLoadingVotesAndCategories() {
    return this.categoryService.stillLoading() ||
      this.votesService.stillLoading();
  }

  hasVotesRemaining(): Observable<boolean> {
    return this.numVotesRemaining().pipe(
      map(numVotes => numVotes > 0)
    );
  }

}
