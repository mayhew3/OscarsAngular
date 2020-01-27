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

@Component({
  selector: 'osc-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss']
})
export class ScoreboardComponent implements OnInit {
  public persons: Person[];
  public latestCategory: Category;
  private me: Person;

  constructor(private personService: PersonService,
              private categoryService: CategoryService,
              private oddsService: OddsService,
              private auth: AuthService) {
    this.persons = [];
  }

  ngOnInit() {
    this.personService.getPersonsForGroup(1).subscribe(persons => {
      this.persons = persons;
      this.auth.getPerson().subscribe(person => {
        this.me = person;

        this.updateScoreboard();
        this.categoryService.subscribeToWinnerEvents().subscribe(() => {
          this.updateScoreboard();
        });
      });
    });
  }

  getOdds(): OddsBundle {
    return this.oddsService.getOdds();
  }

  getOddsForPerson(person: Person): string {
    const odds = this.getOdds();
    try {
      if (odds) {
        const oddsOdds = odds.odds;
        if (!oddsOdds) {
          return 'err';
        }
        const oddsForPerson = _.findWhere(oddsOdds, {person_id: person.id});
        if (!oddsForPerson || !oddsForPerson.odds) {
          return '0%';
        }
        const oddsValue = parseFloat(oddsForPerson.odds) * 100;
        if (!oddsValue) {
          return 'err';
        } else if (oddsValue < 0.1) {
          return '<0.1%';
        } else if (oddsValue > 10) {
          return oddsValue.toFixed(0) + '%';
        } else {
          return oddsValue.toFixed(1) + '%';
        }
      } else {
        return '...';
      }
    } catch (err) {
      console.log(JSON.stringify(odds));
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
    return Math.abs(diff) >= 1;
  }

  oddsDirectionFormatted(person: Person): string {
    const diff = this.oddsDirection(person);
    const formatted = diff.toFixed(0);
    return diff > 0 ? '+' + formatted : formatted;
  }

  oddsDirectionClass(person: Person): string {
    return this.oddsDirection(person) > 0 ? 'oddsDiffGood' : 'oddsDiffBad';
  }

  updateScoreboard(): void {
    this.categoryService.populatePersonScores(this.persons).subscribe(() => {
      this.fastSortPersons();
      this.latestCategory = this.categoryService.getMostRecentCategory();
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
    return !!this.latestCategory && this.categoryService.didPersonVoteCorrectlyFor(person, this.latestCategory);
  }

  fastSortPersons(): void {
    // noinspection JSUnusedGlobalSymbols
    fast_sort(this.persons)
      .by([
        { desc: person => person.score},
        { desc: person => this.isMe(person)},
        { asc: person => person.first_name},
      ]);
  }

  stillLoading(): boolean {
    return this.personService.stillLoading();
  }

  anyoneIsHigherInRankings(person: Person): boolean {
    return this.persons.filter(otherPerson => otherPerson.score > person.score).length > 0;
  }

  scorecardClass(person: Person): string {
    if (this.isMe(person)) {
      return 'myScoreCard';
    } else if (this.anyoneIsHigherInRankings(person)) {
      return 'loserScoreCard';
    } else {
      return 'otherScoreCard';
    }
  }

  scoreNumberClass(person: Person): string {
    if (this.isMe(person)) {
      return 'myScorePoints';
    } else if (this.anyoneIsHigherInRankings(person)) {
      return 'loserScorePoints';
    } else {
      return 'otherScorePoints';
    }
  }

  isMe(person: Person): boolean {
    return person.id === this.me.id;
  }

  public getVoters(): Person[] {
    return _.filter(this.persons, person => person.num_votes);
  }

  /* FILTER OPTIONS */

  changeOddsOption(oddsFilter: OddsFilter): void {
    this.me.odds_filter = oddsFilter;
    this.personService.updatePerson(this.me).subscribe();
  }
}
