import { Component, OnInit } from '@angular/core';
import {Person} from '../../interfaces/Person';
import {PersonService} from '../../services/person.service';
import {CategoryService} from '../../services/category.service';

@Component({
  selector: 'osc-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss']
})
export class ScoreboardComponent implements OnInit {
  public persons: Person[];

  constructor(private personService: PersonService,
              private categoryService: CategoryService) { }

  ngOnInit() {
    this.personService.getPersonsForGroup(1).subscribe(persons => {
      this.persons = persons;
      this.categoryService.populatePersonScores(this.persons);
    });
  }

  stillLoading(): boolean {
    return this.personService.stillLoading();
  }

}
