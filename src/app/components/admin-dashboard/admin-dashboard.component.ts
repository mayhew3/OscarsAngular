import {Component, OnInit} from '@angular/core';
import {SystemVarsService} from '../../services/system.vars.service';
import {CategoryService} from '../../services/category.service';
import {VotesService} from '../../services/votes.service';
import {WinnersService} from '../../services/winners.service';
import {Observable} from 'rxjs';
import {first, map} from 'rxjs/operators';
import {PersonService} from '../../services/person.service';
import fast_sort from 'fast-sort';
import {SocketService} from '../../services/socket.service';
import {ScoreboardService} from '../../services/scoreboard.service';
import {ScoreData} from '../../interfaces/ScoreData';
import moment from 'moment';
import _ from 'underscore';
import {ArrayUtil} from '../../utility/ArrayUtil';

@Component({
  selector: 'osc-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {

  reloadingData = false;

  winnersDeleting = false;
  winnersDeleted = false;

  sortedData: ScoreData[];

  constructor(private systemVarsService: SystemVarsService,
              private categoryService: CategoryService,
              private votesService: VotesService,
              private winnersService: WinnersService,
              private socket: SocketService,
              private personService: PersonService,
              private scoreboardService: ScoreboardService) { }

  ngOnInit(): void {
    this.socket.on('reset_winners', () => {
      this.winnersDeleting = false;
      this.winnersDeleted = true;
    });

    this.scoreboardService.scoreData$.subscribe(scoreData => {
      this.sortedData = _.filter(scoreData, scoreDatum => scoreDatum.num_votes > 0);
      fast_sort(this.sortedData).desc(scoreDatum => scoreDatum.latestVoteDate);
    });
  }

  get isAdmin(): boolean {
    return this.personService.isAdmin;
  }

  get currentYear(): Observable<number> {
    return this.systemVarsService.getCurrentYear();
  }

  personNameFormatted(scoreData: ScoreData): Observable<string> {
    return this.personService.getPersonName(scoreData.person);
  }

  personVotedTimeAgo(scoreDate: ScoreData): string {
    return !scoreDate.latestVoteDate ? '' : moment(scoreDate.latestVoteDate).fromNow();
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
    this.systemVarsService.changeCurrentYear(year);
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
        this.winnersService.resetWinners(year);
      });
  }

  getWinnersButtonClass(): string {
    return this.winnersDeleting ? 'inProcess' : this.winnersDeleted ? 'winnersDeleted' : 'navTitle';
  }
}
