import { Component, OnInit } from '@angular/core';
import {Person} from '../../interfaces/Person';
import {PersonService} from '../../services/person.service';
import {CategoryService} from '../../services/category.service';
import {_} from 'underscore';

@Component({
  selector: 'osc-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss']
})
export class ScoreboardComponent implements OnInit {
  public persons: Person[];

  constructor(private personService: PersonService,
              private categoryService: CategoryService) {
    this.persons = [];
  }

  ngOnInit() {
    this.personService.getPersonsForGroup(1).subscribe(persons => {
      this.persons = persons;
      this.categoryService.populatePersonScores(this.persons);
    });
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
