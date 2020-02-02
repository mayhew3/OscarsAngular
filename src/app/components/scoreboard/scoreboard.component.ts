import {Component, OnInit} from '@angular/core';
import {Person} from '../../interfaces/Person';
import {PersonService} from '../../services/person.service';
import {CategoryService} from '../../services/category.service';
import {_} from 'underscore';
import {OddsService} from '../../services/odds.service';
import {OddsBundle} from '../../interfaces/OddsBundle';
import {AuthService} from '../../services/auth/auth.service';
import fast_sort from 'fast-sort';
import {Category} from '../../interfaces/Category';
import {Winner} from '../../interfaces/Winner';
import * as moment from 'moment';
import {Nominee} from '../../interfaces/Nominee';
import {OddsFilter} from '../odds.filter';
import {SocketService} from '../../services/socket.service';
import {Observable} from 'rxjs';
import {SystemVarsService} from '../../services/system.vars.service';

@Component({
  selector: 'osc-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss']
})
export class ScoreboardComponent implements OnInit {
  persons: Person[];
  latestCategory: Category;
  me: Person;
  updatingOddsFilter = false;

  constructor(private personService: PersonService,
              private categoryService: CategoryService,
              private oddsService: OddsService,
              private auth: AuthService,
              private socket: SocketService,
              private systemVarsService: SystemVarsService) {
    this.persons = [];
  }

  ngOnInit() {
    this.personService.getPersonsForGroup(1).subscribe(persons => {
      this.persons = persons;
      this.auth.getPerson().subscribe(person => {
        this.me = person;

        this.updateScoreboard().subscribe(() => {
          this.socket.on('reconnect', () => {
            this.refreshData();
          });
        });

        this.categoryService.subscribeToWinnerEvents().subscribe(() => {
          this.clearSortingOdds();
          this.updateScoreboard().subscribe();
        });
        this.oddsService.subscribeToOddsEvents().subscribe(() => {
          this.fastSortPersons();
        });

      });
    });
  }

  adminRefreshData(): void {
    if (this.auth.isAdmin()) {
      this.refreshData();
    }
  }

  getOddsStyle(person: Person): string {
    if (!!person) {
      const numericOddsForPerson = this.getNumericOddsForPerson(person);
      if (!!numericOddsForPerson) {
        if (numericOddsForPerson === 100.0) {
          return 'hsl(48, 100%, 56%)';
        } else {
          return `hsl(25, ${numericOddsForPerson}%, 60%)`;
        }
      }
    }
    return `hsl(25, 0%, 60%)`;
  }

  refreshData(): void {
    this.categoryService.refreshCache().subscribe(() => {
      this.oddsService.refreshCache().subscribe(() => {
        this.clearSortingOdds();
        this.updateScoreboard().subscribe();
      });
    });
  }

  clearSortingOdds(): void {
    _.forEach(this.persons, person => person.sortingOdds = -1);
  }

  getOdds(): OddsBundle {
    return this.oddsService.getOdds();
  }

  shouldShowEliminationOdds(): boolean {
    return this.me.odds_filter === 'show';
  }

  shouldHideElimination(): boolean {
    return this.me.odds_filter === 'hideElimination';
  }

  getSortingOddsForPerson(person: Person): number {
    try {
      const numericOdds = this.getNumericOddsForPerson(person);
      if (numericOdds === undefined) {
        return -1;
      } else {
        return numericOdds;
      }
    } catch (err) {
      return -1;
    }
  }

  getNumericOddsForPerson(person: Person): number {
    const isEliminated = this.categoryService.isEliminated(person, this.persons);
    if (isEliminated && !this.shouldHideElimination()) {
      return 0.0;
    }

    const odds = this.getOdds();
    if (odds) {
      const oddsOdds = odds.odds;
      if (!oddsOdds) {
        throw new Error('No odds object found.');
      }
      const oddsForPerson = _.findWhere(oddsOdds, {person_id: person.id});
      if (!oddsForPerson || !oddsForPerson.odds) {
        return 0.001;
      }
      if (!!oddsForPerson.clinched && !this.shouldHideElimination()) {
        return 100.0;
      }
      const oddsValue = parseFloat(oddsForPerson.odds) * 100;
      if (!oddsValue) {
        throw new Error('Invalid float value: ' + oddsForPerson.odds);
      } else if (oddsValue === 100.0) {
        return 99.9;
      } else {
        return oddsValue;
      }
    } else {
      return undefined;
    }
  }

  itsOver(): boolean {
    return this.systemVarsService.itsOver();
  }

  getOddsForPerson(person: Person): string {

    try {
      const numericOdds = this.getNumericOddsForPerson(person);

      if (this.itsOver()) {
        if (numericOdds === 100.0) {
          return 'WINNER!';
        } else {
          return '';
        }
      }

      if (numericOdds === undefined) {
        return '...';
      } else if (numericOdds === 0.0) {
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

  oddsDirection(person: Person): number {
    const currentOdds = this.oddsService.getOdds();
    const previousOdds = this.oddsService.getPreviousOdds();

    if (!!currentOdds && !!previousOdds) {
      const currentOddsForPerson = _.findWhere(currentOdds.odds, {person_id: person.id});
      const previousOddsForPerson = _.findWhere(previousOdds.odds, {person_id: person.id});

      const currentValue = !currentOddsForPerson ? 0 : parseFloat(currentOddsForPerson.odds) * 100;
      const previousValue = !previousOddsForPerson ? 0 : parseFloat(previousOddsForPerson.odds) * 100;

      return currentValue - previousValue;
    }
    return 0;
  }

  showOddsChange(person: Person): boolean {
    const diff = this.oddsDirection(person);
    return !this.itsOver() && Math.abs(diff) >= 1;
  }

  shouldShowOdds(): boolean {
    return this.me.odds_filter !== 'hide';
  }

  oddsDirectionFormatted(person: Person): string {
    const diff = this.oddsDirection(person);
    const formatted = diff.toFixed(0);
    return diff > 0 ? '+' + formatted : formatted;
  }

  oddsDirectionClass(person: Person): string {
    return this.oddsDirection(person) > 0 ? 'oddsDiffGood' : 'oddsDiffBad';
  }

  updateScoreboard(): Observable<any> {
    return new Observable<any>(observer => {
      this.categoryService.populatePersonScores(this.persons).subscribe(() => {
        this.fastSortPersons();
        this.latestCategory = this.categoryService.getMostRecentCategory();
        observer.next();
      });
    });
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

  getWinnerName(winner: Winner): string {
    return this.categoryService.getNomineeFromWinner(winner).nominee;
  }

  getWinnerSubtitle(winner: Winner): string {
    const nominee = this.categoryService.getNomineeFromWinner(winner);
    return this.getSubtitleText(nominee);
  }

  getSubtitleText(nominee: Nominee): string {
    return Nominee.getSubtitleText(this.latestCategory, nominee);
  }

  meGotPointsForLastWinner(): boolean {
    return this.gotPointsForLastWinner(this.me);
  }

  getPersonName(person: Person): string {
    if (this.personService.hasDuplicateFirstName(person)) {
      if (this.personService.hasDuplicateFirstAndLastName(person)) {
        if (!!person.middle_name) {
          return person.first_name + ' ' + person.middle_name.charAt(0);
        } else {
          return person.first_name + ' ' + person.last_name.charAt(0);
        }
      } else {
        return person.first_name + ' ' + person.last_name.charAt(0);
      }
    } else {
      return person.first_name;
    }
  }

  getMyLastWinnerScoreClass(): string {
    return this.meGotPointsForLastWinner() ? 'footerWinningScore' : 'footerLosingScore';
  }

  gotPointsForLastWinner(person: Person): boolean {
    return !this.itsOver() && !!this.latestCategory && this.categoryService.didPersonVoteCorrectlyFor(person, this.latestCategory);
  }

  getPlayersInFirstPlace(): Person[] {
    return _.filter(this.persons, person => !this.anyoneIsHigherInRankings(person));
  }

  getWinnerFullNames(): string[] {
    const winners = this.getPlayersInFirstPlace();
    return _.map(winners, winner => this.personService.getFullName(winner));
  }

  fastSortPersons(): void {
    // noinspection JSUnusedGlobalSymbols
    _.forEach(this.persons, person => person.sortingOdds = this.getSortingOddsForPerson(person));
    fast_sort(this.persons)
      .by([
        { desc: person => person.score},
        { desc: person => person.sortingOdds},
        { asc: person => person.first_name},
      ]);
  }

  stillLoading(): boolean {
    return this.personService.stillLoading() || this.categoryService.stillLoading() || this.oddsService.stillLoading();
  }

  anyoneIsHigherInRankings(person: Person): boolean {
    return this.persons.filter(otherPerson => otherPerson.score > person.score).length > 0;
  }

  scorecardClass(person: Person): string {
    const isEliminated = this.categoryService.isEliminated(person, this.persons);
    if (this.isMe(person)) {
      return 'myScoreCard';
    } else if (isEliminated && this.shouldShowEliminationOdds()) {
      return 'eliminatedScoreCard';
    } else if (this.anyoneIsHigherInRankings(person)) {
      return 'loserScoreCard';
    } else {
      return 'otherScoreCard';
    }
  }

  scoreNumberClass(person: Person): string {
    const isEliminated = this.categoryService.isEliminated(person, this.persons);
    if (this.gotPointsForLastWinner(person) && !this.itsOver()) {
      return 'winnerScorePoints';
    } else if (this.isMe(person)) {
      return 'myScorePoints';
    } else if (isEliminated && this.shouldShowEliminationOdds()) {
      return 'eliminatedScorePoints';
    } else if (this.anyoneIsHigherInRankings(person)) {
      return 'loserScorePoints';
    } else {
      return 'otherScorePoints';
    }
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
    return person.id === this.me.id;
  }

  public getVoters(): Person[] {
    // noinspection TypeScriptValidateJSTypes
    return _.filter(this.persons, person => person.num_votes);
  }

  /* FILTER OPTIONS */

  changeOddsOption(oddsKey: string): void {
    this.me.odds_filter = oddsKey;
    this.updatingOddsFilter = true;
    this.personService.updatePerson(this.me).subscribe(() => {
      this.updatingOddsFilter = false;
    });
  }

  /* CATEGORY PROGRESS BAR */

  getTotalCategoryCount(): number {
    return this.categoryService.getCategoryCountNow();
  }

  getWinnerCategoryCount(): number {
    return this.categoryService.getCategoriesWithWinners().length;
  }
}
