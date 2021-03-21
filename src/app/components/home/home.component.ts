import {Component, OnInit} from '@angular/core';
import {SystemVarsService} from '../../services/system.vars.service';
import {CategoryService} from '../../services/category.service';
import {VotesService} from '../../services/votes.service';
import {MyAuthService} from '../../services/auth/my-auth.service';

@Component({
  selector: 'osc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(public auth: MyAuthService,
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

  getFailedEmail(): string {
    return this.auth.getFailedEmail();
  }

  numVotesRemaining(): number {
    const me = this.auth.getPersonNow();
    if (!!me) {
      const numVotes = this.votesService.getVotesForCurrentYearAndPerson(me).length;
      return !!this.categoryCount() ? this.categoryCount() - numVotes : 0;
    } else {
      return 0;
    }
  }

  getOscarYear(): number {
    return this.systemVarsService.getCurrentYear();
  }

  isLoggedOut(): boolean {
    return !this.auth.isLoggedIn();
  }

  stillLoading(): boolean {
    return this.auth.stillLoading() ||
      this.systemVarsService.stillLoading();
  }

  stillLoadingVotesAndCategories() {
    return this.categoryService.stillLoading() ||
      this.votesService.stillLoading();
  }

  hasVotesRemaining(): boolean {
    return this.numVotesRemaining() > 0;
  }

}
