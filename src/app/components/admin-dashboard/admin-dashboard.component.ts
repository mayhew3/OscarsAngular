import { Component, OnInit } from '@angular/core';
import {SystemVarsService} from '../../services/system.vars.service';
import {CategoryService} from '../../services/category.service';
import {VotesService} from '../../services/votes.service';
import {_} from 'underscore';
import {WinnersService} from '../../services/winners.service';
import {AuthService} from '../../services/auth/auth.service';

@Component({
  selector: 'osc-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  reloadingData = false;

  currentYear: number;
  possibleYears: number[] = [];

  winnersDeleting = false;
  winnersDeleted = false;

  constructor(private systemVarsService: SystemVarsService,
              private categoryService: CategoryService,
              private votesService: VotesService,
              private winnersService: WinnersService,
              private auth: AuthService) { }

  ngOnInit() {
    this.systemVarsService.getSystemVars().subscribe(systemVars => {
      this.categoryService.getMaxYear().subscribe(maxYear => {
        this.currentYear = systemVars.curr_year;
        this.possibleYears.push(maxYear - 1);
        this.possibleYears.push(maxYear);
        if (!_.contains(this.possibleYears, this.currentYear)) {
          this.possibleYears.push(this.currentYear);
        }
      });
    });
  }

  stillLoading(): boolean {
    return this.categoryService.stillLoading() ||
      this.systemVarsService.stillLoading();
  }

  getVotingHeader(): string {
    return this.systemVarsService.canVote() ? 'Voting Open' : 'Voting Locked';
  }

  yearButtonClass(year): string {
    if (this.currentYear === year) {
      return 'btn-success';
    } else {
      return 'btn-primary';
    }
  }

  changeCurrentYear(year): void {
    this.reloadingData = true;
    this.systemVarsService.changeCurrentYear(year).subscribe(() => {
      this.categoryService.refreshCache().subscribe(() => {
        this.votesService.refreshCache(year).subscribe(() => {
          this.reloadingData = false;
          this.currentYear = year;
        });
      });
    });
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
