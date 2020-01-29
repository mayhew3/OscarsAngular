import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth/auth.service';
import {SystemVarsService} from '../../services/system.vars.service';
import {WinnersService} from '../../services/winners.service';
import {CategoryService} from '../../services/category.service';

@Component({
  selector: 'osc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  winnersDeleting = false;
  winnersDeleted = false;

  constructor(public auth: AuthService,
              public systemVarsService: SystemVarsService,
              private winnersService: WinnersService,
              private categoryService: CategoryService) { }

  ngOnInit() {
    this.categoryService.subscribeToWinnerEvents().subscribe(() => {
      this.winnersDeleting = false;
      this.winnersDeleted = true;
    });
  }

  getOscarYear(): number {
    return this.systemVarsService.getCurrentYear();
  }

  isLoggedOut(): boolean {
    return !this.auth.isLoggedIn();
  }

  stillLoading(): boolean {
    return this.auth.stillLoading() || this.systemVarsService.stillLoading();
  }

  getVotingHeader(): string {
    return this.systemVarsService.canVote() ? 'Voting Open' : 'Voting Locked';
  }

  toggleVotingLock(): void {
    this.systemVarsService.toggleVotingLock();
  }

  resetWinners(): void {
    this.systemVarsService.getSystemVars().subscribe(systemVars => {
      const year = systemVars.curr_year;
      this.winnersDeleting = true;
      this.winnersService.resetWinners(year).subscribe();
    });
  }

  getWinnersButtonClass(): string {
    return this.winnersDeleting ? 'inProcess' : this.winnersDeleted ? 'winnersDeleted' : 'navTitle';
  }
}
