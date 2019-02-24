import {Component, OnInit} from '@angular/core';
import {Person} from '../../interfaces/Person';
import {PersonService} from '../../services/person.service';
import {CategoryService} from '../../services/category.service';
import {_} from 'underscore';
import {OddsService} from '../../services/odds.service';
import {Odds} from '../../interfaces/Odds';
import {OddsBundle} from '../../interfaces/OddsBundle';

@Component({
  selector: 'osc-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss']
})
export class ScoreboardComponent implements OnInit {
  public persons: Person[];

  constructor(private personService: PersonService,
              private categoryService: CategoryService,
              private oddsService: OddsService) {
    this.persons = [];
  }

  ngOnInit() {
    this.personService.getPersonsForGroup(1).subscribe(persons => {
      this.persons = persons;
      this.categoryService.populatePersonScores(this.persons);
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
    if (odds) {
      const oddsForPerson = _.findWhere(odds.odds, {person_id: person.id});
      const oddsValue = parseFloat(oddsForPerson.odds) * 100;
      if (oddsValue < 0.1) {
        return '<0.1%';
      } else if (oddsValue > 10) {
        return oddsValue.toFixed(0) + '%';
      } else {
        return oddsValue.toFixed(1) + '%';
      }
    } else {
      return '--';
    }
  }

  updateScoreboard(): void {
    this.categoryService.populatePersonScores(this.persons);
  }

  stillLoading(): boolean {
    return this.personService.stillLoading();
  }

  public getVoters(): Person[] {
    return _.filter(this.persons, person => person.num_votes).sort((person1, person2) => {
      if (person1.score === person2.score) {
        return person2.first_name > person1.first_name ? -1 : 1;
      } else {
        return person2.score - person1.score;
      }
    });
  }
}
