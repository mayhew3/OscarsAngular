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
import {ApiService} from '../../services/api.service';
import {ScoreboardService} from '../../services/scoreboard.service';
import {oddsUrl} from '../../../shared/GlobalVars';
import moment from 'moment';
import {CeremonyService} from '../../services/ceremony.service';

@Component({
  selector: 'osc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  authenticatingColor: ThemePalette = 'primary';
  loadingColor: ThemePalette = 'accent';
  winnersCached = false;

  constructor(public auth: MyAuthService,
              public personService: PersonService,
              public apiService: ApiService,
              public categoryService: CategoryService,
              public scoreboardService: ScoreboardService,
              private ceremonyService: CeremonyService,
              public votesService: VotesService) {
  }

  ngOnInit(): void {
    this.categoryService.itsOver().subscribe(_ => {
      this.winnersCached = true;
    });
  }

  get me$(): Observable<Person> {
    return this.personService.me$;
  }

  categoryCount(): Observable<number> {
    return this.categoryService.getCategoryCount();
  }

  canVote(): Observable<boolean> {
    return this.ceremonyService.canVote();
  }

  get winnersString(): string {
    return this.scoreboardService.getPlayersInFirstPlaceFullNames().join(' and ');
  }

  get winnerPhrase(): string {
    return this.scoreboardService.getPlayersInFirstPlace().length === 1 ? 'winner is' : 'winners are';
  }

  get singleFirstPlaceNumCorrectVotes(): Observable<number> {
    const firstPlace = this.scoreboardService.getPlayersInFirstPlace()[0];
    return this.votesService.getNumCorrectVotesForCurrentYearAndPerson(firstPlace.person);
  }

  get singleFirstPlaceNumVotes(): Observable<number> {
    const firstPlace = this.scoreboardService.getPlayersInFirstPlace()[0];
    return this.votesService.getVotesForCurrentYearAndPerson(firstPlace.person).pipe(
      map(votes => votes.length)
    );
  }

  showWinnerDetail(): boolean {
    return this.scoreboardService.getPlayersInFirstPlace().length === 1;
  }

  get ceremonyDate(): Observable<Date> {
    return this.ceremonyService.getCurrentCeremonyYear().pipe(
      map(ceremonyYear => ceremonyYear.ceremony_date)
    );
  }

  showPast(): Observable<boolean> {
    return combineLatest([this.personService.me$, this.ceremonyService.getCurrentCeremony()]).pipe(
      mergeMap(([me, ceremony]) => this.ceremonyService.hasPastCeremonies(me, ceremony.id))
    );
  }

  get ceremonyDateFormatted(): Observable<string> {
    return this.ceremonyDate.pipe(
      map(ceremonyDate => moment(ceremonyDate).local().format('dddd, MMMM Do YYYY, h:mm a'))
    );
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

  get ceremonyName(): Observable<string> {
    return this.ceremonyService.getCurrentCeremonyName();
  }

  get ceremonyContent(): Observable<string> {
    return this.ceremonyName.pipe(
      map(ceremonyName => ceremonyName === 'Oscars' ? 'films' : 'shows')
    );
  }

  get ceremonyOddsUrl(): string {
    return oddsUrl;
  }

  getCeremonyYear(): Observable<number> {
    return this.ceremonyService.getCurrentYear();
  }

  hasVotesRemaining(): Observable<boolean> {
    return this.numVotesRemaining().pipe(
      map(numVotes => numVotes > 0)
    );
  }

}
