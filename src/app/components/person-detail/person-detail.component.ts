import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {PersonService} from '../../services/person.service';
import {Person} from '../../interfaces/Person';

@Component({
  selector: 'osc-person-detail',
  templateUrl: './person-detail.component.html',
  styleUrls: ['./person-detail.component.scss']
})
export class PersonDetailComponent implements OnInit {
  private person: Person;

  constructor(private route: ActivatedRoute,
              private personService: PersonService) { }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      const person_id = +params['person_id'];
      this.personService.getPerson(person_id).subscribe(person => {
        this.person = person;
      });
    });
  }

}
