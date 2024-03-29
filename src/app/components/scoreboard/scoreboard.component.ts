import {Component, OnInit} from '@angular/core';
import {Person} from '../../interfaces/Person';
import {PersonService} from '../../services/person.service';
import {CategoryService} from '../../services/category.service';
import * as _ from 'underscore';
import {OddsService} from '../../services/odds.service';
import fast_sort from 'fast-sort';
import {Category} from '../../interfaces/Category';
import {Winner} from '../../interfaces/Winner';
import * as moment from 'moment';
import {Nominee} from '../../interfaces/Nominee';
import {OddsFilter} from '../odds.filter';
import {combineLatest, first, mergeMap, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {VotesService} from '../../services/votes.service';
import {Select} from '@ngxs/store';
import {OddsState} from '../../states/odds.state';
import {ThemePalette} from '@angular/material/core';
import {SocketService} from '../../services/socket.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ScoreData} from '../../interfaces/ScoreData';
import {ScoreboardService} from '../../services/scoreboard.service';
import {PersonNotificationService} from '../../services/person-notification.service';

@Component({
  selector: 'osc-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss']
})
export class ScoreboardComponent implements OnInit {
  @Select(OddsState.updating) oddsOutOfDate$: Observable<boolean>;

  latestCategory: Category;
  me: Person;
  updatingOddsFilter = false;

  footerMinimized = false;

  loadingColor: ThemePalette = 'accent';

  constructor(private personService: PersonService,
              private categoryService: CategoryService,
              private voteService: VotesService,
              public oddsService: OddsService,
              public scoreboardService: ScoreboardService) {
  }

  ngOnInit(): void {
    this.personService.me$.subscribe(person => {
      this.me = person;
      this.categoryService.getMostRecentCategory().subscribe(category => this.latestCategory = category);
    });

  }

  getOddsStyle(scoreData: ScoreData): string {
    const numericOddsForPerson = this.getNumericOddsForPerson(scoreData);
    try {
      if (!!numericOddsForPerson) {
        if (numericOddsForPerson === 100.0) {
          return 'hsl(48, 100%, 56%)';
        } else {
          return `hsl(25, ${numericOddsForPerson}%, 60%)`;
        }
      }
    } catch (err) {
      return 'hsl(0, 90%, 60%)';
    }
    return `hsl(25, 0%, 60%)`;
  }

  shouldShowEliminationOdds(): boolean {
    return !!this.me && this.me.odds_filter === 'show';
  }

  isEliminated(scoreData: ScoreData): boolean {
     return this.scoreboardService.isEliminated(scoreData);
  }

  getNumericOddsForPerson(scoreData: ScoreData): number {
    return this.scoreboardService.getNumericOddsForPerson(scoreData);
  }

  itsOver(): Observable<boolean> {
    return this.categoryService.itsOver();
  }

  getOddsForPerson(scoreData: ScoreData): string {
    const numericOdds = this.getNumericOddsForPerson(scoreData);
    try {
      if (numericOdds === 0.0) {
        return '0%';
      } else if (numericOdds === 100.0) {
        return '100%';
      } else if (numericOdds < 1.0) {
        return '<1%';
      } else if (numericOdds > 99.0) {
        return '>99%';
      } else if (numericOdds > 10) {
        return numericOdds.toFixed(0) + '%';
      } else {
        return numericOdds.toFixed(1) + '%';
      }
    } catch (err) {
      return 'err';
    }
  }

  oddsDirection(scoreData: ScoreData): number {
    if (!!scoreData.odds && !!scoreData.previousOdds) {
      const currentValue = !scoreData.odds ? 0 : scoreData.odds.odds * 100;
      const previousValue = !scoreData.previousOdds ? 0 : scoreData.previousOdds.odds * 100;

      return currentValue - previousValue;
    }
    return 0;
  }

  showOddsChange(scoreData: ScoreData): boolean {
    const diff = this.oddsDirection(scoreData);
    return Math.abs(diff) >= 1;
  }

  shouldShowOdds(): Observable<boolean> {
    return this.itsOver().pipe(
      map(itsOver => !itsOver && this.me.odds_filter !== 'hide')
    );
  }

  oddsDirectionFormatted(scoreData: ScoreData): string {
    const diff = this.oddsDirection(scoreData);
    const formatted = diff.toFixed(0);
    return diff > 0 ? '+' + formatted : formatted;
  }

  oddsDirectionClass(scoreData: ScoreData): string {
    return this.oddsDirection(scoreData) > 0 ? 'oddsDiffGood' : 'oddsDiffBad';
  }

  getLastTimeAgo(): string {
    if (this.latestCategory) {
      // noinspection TypeScriptValidateJSTypes
      const declaredDates = _.map(this.latestCategory.winners, winner => winner.declared);
      // noinspection TypeScriptValidateJSTypes
      fast_sort(declaredDates).desc();
      if (declaredDates.length > 0) {
        const mostLatest = declaredDates[0];
        return moment(mostLatest).fromNow();
      }
    }
    return '';
  }

  getWinnerName(winner: Winner): Observable<string> {
    return this.categoryService.getNomineeFromWinner(winner).pipe(
      map(nominee => nominee.nominee)
    );
  }

  getWinnerSubtitle(winner: Winner): Observable<string> {
    return this.categoryService.getNomineeFromWinner(winner).pipe(
      mergeMap(nominee => this.getSubtitleText(nominee))
    );
  }

  getSubtitleText(nominee: Nominee): Observable<string> {
    return this.categoryService.getSubtitleText(this.latestCategory, nominee);
  }

  meGotPointsForLastWinner(): Observable<boolean> {
    return this.gotPointsForLastWinner(this.me);
  }

  getPersonName(person: Person): Observable<string> {
    return this.personService.getPersonName(person);
  }

  getMyLastWinnerScoreClass(): string {
    return this.meGotPointsForLastWinner() ? 'footerWinningScore' : 'footerLosingScore';
  }

  gotPointsForLastWinner(person: Person): Observable<boolean> {
    return combineLatest([
      this.voteService.didPersonVoteCorrectlyFor(person, this.latestCategory),
      this.itsOver()]
    ).pipe(
      map(([correctly, itsOver]) => !itsOver && !!this.latestCategory && correctly)
    );
  }

  get allScores(): ScoreData[] {
    return this.scoreboardService.allScores;
  }

  getRank(scoreData: ScoreData): string {
    const myScore = scoreData.score;
    const myRank = _.filter(this.allScores, otherScoreData => otherScoreData.score > myScore).length + 1;
    return moment.localeData().ordinal(myRank);
  }

  anyoneIsHigherInRankings(scoreData: ScoreData): boolean {
    const myScore = scoreData.score;
    return this.allScores.filter(otherPerson => otherPerson.score > myScore).length > 0;
  }

  scorecardClass(scoreData: ScoreData): Observable<string> {
    return this.itsOver().pipe(
      map(itsOver => {
        const isEliminated = this.isEliminated(scoreData);
        if (this.isMe(scoreData.person)) {
          return 'myScoreCard';
        } else if (!itsOver && isEliminated && this.shouldShowEliminationOdds()) {
          return 'eliminatedScoreCard';
        } else if (this.anyoneIsHigherInRankings(scoreData)) {
          return 'loserScoreCard';
        } else {
          return 'otherScoreCard';
        }
      })
    );
  }

  scoreNumberClass(scoreData: ScoreData): Observable<string> {
    return combineLatest([this.itsOver(), this.gotPointsForLastWinner(scoreData.person)]).pipe(
      map(([itsOver, gotPoints]) => {
        const isEliminated = this.isEliminated(scoreData);
        if (gotPoints && !itsOver) {
          return 'winnerScorePoints';
        } else if (this.isMe(scoreData.person)) {
          return 'myScorePoints';
        } else if (!itsOver && isEliminated && this.shouldShowEliminationOdds()) {
          return 'eliminatedScorePoints';
        } else if (this.anyoneIsHigherInRankings(scoreData)) {
          return 'loserScorePoints';
        } else {
          return 'otherScorePoints';
        }
      })
    );
  }

  getOddsOptions(): string[] {
    return Object.keys(OddsFilter);
  }

  getDisplayValueOf(oddsOption: string): string {
    return OddsFilter[oddsOption];
  }

  isOddsOptionSelected(oddsOption: string): boolean {
    return this.me.odds_filter === oddsOption;
  }

  getOddsFilterClass(oddsOption: string): string {
    return this.isOddsOptionSelected(oddsOption) ? 'selectedOddsFilter' : '';
  }

  isMe(person: Person): boolean {
    return !!this.me && person.id === this.me.id;
  }

  /* FILTER OPTIONS */

  changeOddsOption(oddsKey: string): void {
    this.updatingOddsFilter = true;
    this.personService.updatePerson(this.me, oddsKey).subscribe(() => {
      this.updatingOddsFilter = false;
    });
  }

  /* CATEGORY PROGRESS BAR */

  getTotalCategoryCount(): Observable<number> {
    return this.categoryService.getCategoryCount();
  }

  getWinnerCategoryCount(): Observable<number> {
    return this.categoryService.getWinnerCategoryCount();
  }

}
