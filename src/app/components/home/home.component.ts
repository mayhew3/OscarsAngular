import {Component, OnInit} from '@angular/core';
import {SystemVarsService} from '../../services/system.vars.service';
import {CategoryService} from '../../services/category.service';
import {VotesService} from '../../services/votes.service';
import {MyAuthService} from '../../services/auth/my-auth.service';
import {concatMap, map} from 'rxjs/operators';
import {combineLatest, Observable} from 'rxjs';
import {PersonService} from '../../services/person.service';
import {Person} from '../../interfaces/Person';

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
  }

  ngOnInit() {
  }

  get me$(): Observable<Person> {
    return this.personService.me$;
  }

  categoryCount(): Observable<number> {
    return this.categoryService.getCategoryCount();
  }

  getFailedEmail(): boolean {
    return this.auth.failedEmail;
  }

  numVotesRemaining(): Observable<number> {
    const categoryCount$ = this.categoryCount();
    const votes$ = this.personService.me$.pipe(
      concatMap(me => this.votesService.getVotesForCurrentYearAndPerson(me))
    );
    return combineLatest([categoryCount$, votes$]).pipe(
      map(([categoryCount, votes]) => !!categoryCount ? categoryCount - votes.length : 0)
    );
  }

  getOscarYear(): number {
    return this.systemVarsService.getCurrentYear();
  }

  get isLoggedIn$(): Observable<boolean> {
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
