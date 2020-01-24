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

@Component({
  selector: 'osc-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss']
})
export class ScoreboardComponent implements OnInit {
  public persons: Person[];
  public latestCategory: Category;

  constructor(private personService: PersonService,
              private categoryService: CategoryService,
              private oddsService: OddsService,
              private auth: AuthService) {
    this.persons = [];
  }

  ngOnInit() {
    this.personService.getPersonsForGroup(1).subscribe(persons => {
      this.persons = persons;

      this.updateScoreboard();
      this.categoryService.subscribeToWinnerEvents().subscribe(() => {
        this.updateScoreboard();
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

  updateScoreboard(): void {
    this.categoryService.populatePersonScores(this.persons).subscribe(() => {
      this.fastSortPersons();
      this.latestCategory = this.categoryService.getMostRecentCategory();
    });
  }

  getLastTimeAgo(): string {
    if (this.latestCategory) {
      const declaredDates = _.map(this.latestCategory.winners, winner => winner.declared);
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

  gotPointsForLastWinner(person: Person): boolean {
    return this.categoryService.didPersonVoteCorrectlyFor(person, this.latestCategory);
  }

  fastSortPersons(): void {
    this.persons = _.filter(this.persons, person => person.num_votes);
    fast_sort(this.persons)
      .by([
        { desc: person => person.score},
        { desc: person => this.auth.isMe(person)},
        { asc: person => person.first_name},
      ]);
  }

  stillLoading(): boolean {
    return this.personService.stillLoading();
  }

  scorecardClass(person: Person): string {
    if (this.auth.isMe(person)) {
      return 'myScoreCard';
    } else {
      return 'otherScoreCard';
    }
  }

  scoreNumberClass(person: Person): string {
    return this.auth.isMe(person) ? 'myScorePoints' : 'otherScorePoints';
  }

  public getVoters(): Person[] {
    return this.persons;
  }
}
