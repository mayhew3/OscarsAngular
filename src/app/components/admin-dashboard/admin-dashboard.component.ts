import {Component, OnInit} from '@angular/core';
import {SystemVarsService} from '../../services/system.vars.service';
import {CategoryService} from '../../services/category.service';
import {VotesService} from '../../services/votes.service';
import {WinnersService} from '../../services/winners.service';
import {OddsService} from '../../services/odds.service';
import {Observable} from 'rxjs';
import {first, map} from 'rxjs/operators';
import {PersonService} from '../../services/person.service';
import fast_sort from 'fast-sort';

@Component({
  selector: 'osc-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {

  reloadingData = false;

  winnersDeleting = false;
  winnersDeleted = false;

  constructor(private systemVarsService: SystemVarsService,
              private categoryService: CategoryService,
              private votesService: VotesService,
              private winnersService: WinnersService,
              private oddsService: OddsService,
              private personService: PersonService) { }

  ngOnInit(): void {
    this.categoryService.subscribeToWinnerEvents().subscribe(() => {
      this.winnersDeleting = false;
      this.winnersDeleted = true;
    });
  }

  get isAdmin(): boolean {
    return this.personService.isAdmin;
  }

  get currentYear(): Observable<number> {
    return this.systemVarsService.getCurrentYear();
  }

  getPossibleYears(currentYear: number): Observable<number[]> {
    return this.categoryService.getMaxYear().pipe(
      map(maxYear => {
        const yearsSet = new Set<number>();
        yearsSet.add(maxYear);
        yearsSet.add(maxYear - 1);
        yearsSet.add(currentYear);
        const yearsList = Array.from(yearsSet);
        fast_sort(yearsList);
        return yearsList;
      })
    );
  }

  refreshAllData(): void {
    this.categoryService.emptyCache();
    this.categoryService.maybeRefreshCache();
    this.votesService.refreshCacheForThisYear().subscribe();
    this.oddsService.refreshCache().subscribe();
  }

  stillLoading(): boolean {
    return this.systemVarsService.stillLoading();
  }

  isVotingOpen(): Observable<boolean> {
    return this.systemVarsService.canVote();
  }

  getVotingButtonClass(votingOpen: boolean): Observable<string> {
    return this.isVotingOpen().pipe(
      map(isVotingOpen => isVotingOpen === votingOpen ? 'btn-success' : 'btn-primary')
    );
  }

  changeCurrentYear(year): void {
    this.reloadingData = true;
    this.categoryService.emptyCache();

    this.systemVarsService.changeCurrentYear(year).subscribe(() => {
      this.categoryService.categories.subscribe(() => {
        this.votesService.refreshCache(year).subscribe(() => {
          this.reloadingData = false;
        });
      });
    });
    // this.categoryService.maybeRefreshCache();
  }

  toggleVotingLock(votingOpen: boolean): void {
    this.isVotingOpen().pipe(first())
      .subscribe(isVotingOpen => {
        if (votingOpen !== isVotingOpen) {
          this.systemVarsService.toggleVotingLock();
        }
      }
    );
  }

  resetWinners(): void {
    this.systemVarsService.systemVars
      .pipe(first())
      .subscribe(systemVars => {
        const year = systemVars.curr_year;
        this.winnersDeleting = true;
        this.winnersService.resetWinners(year).subscribe();
      });
  }

  getWinnersButtonClass(): string {
    return this.winnersDeleting ? 'inProcess' : this.winnersDeleted ? 'winnersDeleted' : 'navTitle';
  }
}
