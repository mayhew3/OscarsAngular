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
import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {VotesService} from '../../services/votes.service';
import {Vote} from '../../interfaces/Vote';
import {ArrayUtil} from '../../utility/ArrayUtil';
import {Select} from '@ngxs/store';
import {OddsState} from '../../states/odds.state';
import {ThemePalette} from '@angular/material/core';
import {SocketService} from '../../services/socket.service';
import {PersonConnectionSnackBarComponent} from '../person-connection-snack-bar/person-connection-snack-bar.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ScoreData} from '../../interfaces/ScoreData';

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

  scoreData: ScoreData[] = [];

  odds$ = this.oddsService.odds$;
  previousOdds$ = this.oddsService.previousOdds$;

  constructor(private personService: PersonService,
              private categoryService: CategoryService,
              private voteService: VotesService,
              private oddsService: OddsService,
              private socket: SocketService,
              private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.initScoreData();

    this.personService.me$.subscribe(person => {
      this.me = person;
      this.categoryService.getMostRecentCategory().subscribe(category => this.latestCategory = category);
    });

    this.socket.on('person_connected', msg => {
      this.showPersonSnackBar(msg.person_id, true);
    });

    this.socket.on('person_disconnected', msg => {
      this.showPersonSnackBar(msg.person_id, false);
    });
  }

  initScoreData(): void {
    combineLatest([
      this.categoryService.categories,
      this.voteService.votes,
      this.personService.getPersonsForGroup(1),
      this.odds$,
      this.previousOdds$,
    ])
      .subscribe(([categories, votes, persons, oddsBundle, previousOddsBundle]) => {
        ArrayUtil.emptyArray(this.scoreData);
        _.forEach(persons, person => {
          let score = 0;
          let numVotes = 0;
          _.forEach(categories, category => {
            const personVote = _.findWhere(votes, {
              person_id: person.id,
              category_id: category.id
            });
            if (personVote) {
              numVotes++;
              if (category.winners.length > 0) {
                const existingWinner = _.findWhere(category.winners, {nomination_id: personVote.nomination_id});
                if (!!existingWinner) {
                  score += category.points;
                }
              }
            }
          });

          const odds = _.find(oddsBundle.odds, o => o.person_id === person.id);
          const previousOdds = !previousOddsBundle ? undefined : _.find(previousOddsBundle.odds, o => o.person_id === person.id);
          this.scoreData.push(new ScoreData(person, score, numVotes, odds, previousOdds));
        });
        _.each(this.scoreData, sd => {
          sd.maxPosition = this.maxPosition(sd.person, categories, votes);
        });
        this.fastSortPersons();
      });
  }

  maxPosition(person: Person, categories: Category[], votes: Vote[]): number {
    const categoriesWithoutWinners = _.filter(categories, category => !category.winners || category.winners.length === 0);
    const myVotes = _.map(categoriesWithoutWinners, category => {
      const allVotes = _.where(votes, {person_id: person.id, category_id: category.id});
      return allVotes.length === 1 ? allVotes[0] : undefined;
    });
    const finalScores = _.map(this.scoreData, (otherPersonData: ScoreData) => {
      const theirVotes: Vote[] = _.where(votes, {person_id: otherPersonData.person.id});
      const theirVotesThatMatch = _.filter(theirVotes, (vote: Vote) => {
        const myVote = _.findWhere(myVotes, {category_id: vote.category_id});
        return !!myVote && myVote.nomination_id === vote.nomination_id;
      });
      const theirScore = _.reduce(theirVotesThatMatch, (memo: number, theirVote: Vote) => {
        const category = _.findWhere(categories, {id: theirVote.category_id});
        return !!category ? memo + category.points : memo;
      }, 0);
      return {
        person_id: otherPersonData.person.id,
        score: theirScore + otherPersonData.score
      };
    });

    const myScore = _.findWhere(finalScores, {person_id: person.id});
    const scoresBetterThanMine = _.filter(finalScores, otherScore => otherScore.score > myScore.score);
    return scoresBetterThanMine.length + 1;
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

  shouldHideElimination(): boolean {
    return !!this.me && this.me.odds_filter === 'hideElimination';
  }

  getSortingOddsForPerson(scoreData: ScoreData): number {
    const numericOdds = this.getNumericOddsForPerson(scoreData);
    try {
      if (numericOdds === undefined) {
        return -1;
      } else {
        return numericOdds;
      }
    } catch (err) {
      return -1;
    }
  }

  isEliminated(scoreData: ScoreData): boolean {
     return scoreData.maxPosition > 1;
  }

  getNumericOddsForPerson(scoreData: ScoreData): number {
    const isEliminated = this.isEliminated(scoreData);
    if (isEliminated && !this.shouldHideElimination()) {
      return 0.0;
    }

    const oddsForPerson = scoreData.odds;
    if (!oddsForPerson || !oddsForPerson.odds || oddsForPerson.odds === 0) {
      return 0.001;
    }
    if (!!oddsForPerson.clinched && !this.shouldHideElimination()) {
      return 100.0;
    }
    const oddsValue = oddsForPerson.odds * 100;
    if (!oddsValue) {
      const notOdds = !oddsForPerson;
      throw new Error('Invalid float value: ' + oddsForPerson.odds + ', oddsValue: ' + oddsValue + ', notOdds: ' + notOdds);
    } else if (oddsValue === 100.0) {
      return 99.9;
    } else {
      return oddsValue;
    }
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
      map(nominee => this.getSubtitleText(nominee))
    );
  }

  getSubtitleText(nominee: Nominee): string {
    return CategoryService.getSubtitleText(this.latestCategory, nominee);
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

  getPlayersInFirstPlace(): ScoreData[] {
    return _.filter(this.scoreData, scoreData => !this.anyoneIsHigherInRankings(scoreData));
  }

  getWinnerFullNames(): string[] {
    const winners = this.getPlayersInFirstPlace();
    return _.map(winners, winner => this.personService.getFullName(winner.person));
  }


  fastSortPersons(): void {
    fast_sort(this.scoreData)
      .by([
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        { desc: (scoreData: ScoreData) => scoreData.score},
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        { desc: (scoreData: ScoreData) => this.getSortingOddsForPerson(scoreData)},
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        { desc: (scoreData: ScoreData) => this.isMe(scoreData.person)},
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        { asc: (scoreData: ScoreData) => scoreData.person.first_name},
      ]);
  }

  get allScores(): ScoreData[] {
    return Array.from(this.scoreData.values());
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

  public getVoters(): ScoreData[] {
    // noinspection TypeScriptValidateJSTypes
    return _.filter(this.scoreData, scoreData => !!scoreData.num_votes);
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

  private showPersonSnackBar(person_id: number, connected: boolean): void {
    this.personService.getPerson(person_id).subscribe(person => {
      this.snackBar.openFromComponent(PersonConnectionSnackBarComponent,  {
        duration: 3000,
        panelClass: ['playerConnectSnackBar'],
        verticalPosition: 'top',
        horizontalPosition: 'center',
        data: {
          person,
          connected
        }
      });
    });
  }

}
