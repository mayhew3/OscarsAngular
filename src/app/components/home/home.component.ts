import {Component, OnInit} from '@angular/core';
import {SystemVarsService} from '../../services/system.vars.service';
import {CategoryService} from '../../services/category.service';
import {VotesService} from '../../services/votes.service';
import {MyAuthService} from '../../services/auth/my-auth.service';
import {map, mergeMap} from 'rxjs/operators';
import {combineLatest, Observable} from 'rxjs';
import {PersonService} from '../../services/person.service';
import {Person} from '../../interfaces/Person';
import {ThemePalette} from '@angular/material/core';

@Component({
  selector: 'osc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  authenticatingColor: ThemePalette = 'primary';
  loadingColor: ThemePalette = 'accent';
  constructor(public auth: MyAuthService,
              public personService: PersonService,
              public systemVarsService: SystemVarsService,
              public categoryService: CategoryService,
              public votesService: VotesService) {
  }

  ngOnInit(): void {
  }

  get me$(): Observable<Person> {
    return this.personService.me$;
  }

  categoryCount(): Observable<number> {
    return this.categoryService.getCategoryCount();
  }

  get failedEmail(): boolean {
    return this.auth.failedEmail;
  }

  numVotesRemaining(): Observable<number> {
    const categoryCount$ = this.categoryCount();
    const votes$ = this.personService.me$.pipe(
      mergeMap(me => this.votesService.getVotesForCurrentYearAndPerson(me))
    );
    return combineLatest([categoryCount$, votes$]).pipe(
      map(([categoryCount, votes]) => !!categoryCount ? categoryCount - votes.length : 0)
    );
  }

  getOscarYear(): Observable<number> {
    return this.systemVarsService.getCurrentYear();
  }

  hasVotesRemaining(): Observable<boolean> {
    return this.numVotesRemaining().pipe(
      map(numVotes => numVotes > 0)
    );
  }

}
