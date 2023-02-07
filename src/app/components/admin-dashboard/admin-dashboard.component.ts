import {Component, OnInit} from '@angular/core';
import {SystemVarsService} from '../../services/system.vars.service';
import {CategoryService} from '../../services/category.service';
import {VotesService} from '../../services/votes.service';
import {WinnersService} from '../../services/winners.service';
import {firstValueFrom, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {PersonService} from '../../services/person.service';
import { inPlaceSort } from 'fast-sort';
import {SocketService} from '../../services/socket.service';
import {ScoreboardService} from '../../services/scoreboard.service';
import {ScoreData} from '../../interfaces/ScoreData';
import moment from 'moment';
import _ from 'underscore';
import {CeremonyService} from '../../services/ceremony.service';
import {CeremonyStyleService} from '../../services/ceremony-style.service';

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

  constructor(private categoryService: CategoryService,
              private votesService: VotesService,
              private winnersService: WinnersService,
              private socket: SocketService,
              private personService: PersonService,
              private scoreboardService: ScoreboardService,
              private ceremonyService: CeremonyService,
              private ceremonyStyleService: CeremonyStyleService) { }

  get isAdmin(): boolean {
    return this.personService.isAdmin;
  }

  toggleStyle(): void {
    this.ceremonyStyleService.toggleStyle();
  }

  get currentYear(): Observable<number> {
    return this.ceremonyService.getCurrentYear();
  }

  ngOnInit(): void {
    this.socket.on('reset_winners', () => {
      this.winnersDeleting = false;
      this.winnersDeleted = true;
    });

    this.scoreboardService.scoreData$.subscribe(scoreData => {
      this.sortedData = _.filter(scoreData, scoreDatum => scoreDatum.num_votes > 0);
      inPlaceSort(this.sortedData).desc(scoreDatum => scoreDatum.latestVoteDate);
    });
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
        inPlaceSort(yearsList);
        return yearsList;
      })
    );
  }

  isVotingOpen(): Observable<boolean> {
    return this.ceremonyService.canVote();
  }

  getVotingButtonClass(votingOpen: boolean): Observable<string> {
    return this.isVotingOpen().pipe(
      map(isVotingOpen => isVotingOpen === votingOpen ? 'btn-success' : 'btn-primary')
    );
  }

  async toggleVotingLock(votingOpen: boolean): Promise<void> {
    const isVotingOpen = await firstValueFrom(this.isVotingOpen());
    if (votingOpen !== isVotingOpen) {
      await this.ceremonyService.toggleVotingLock();
    }
  }

  async resetWinners(): Promise<void> {
    const year = await firstValueFrom(this.ceremonyService.getCurrentYear());
    this.winnersDeleting = true;
    this.winnersService.resetWinners(year);
  }

  getWinnersButtonClass(): string {
    return this.winnersDeleting ? 'inProcess' : this.winnersDeleted ? 'winnersDeleted' : 'navTitle';
  }
}
