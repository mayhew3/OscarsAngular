import {Component} from '@angular/core';
import {ActiveContext} from '../categories.context';
import {PersonService} from '../../services/person.service';

@Component({
  selector: 'osc-winner-main',
  templateUrl: './winner-main.component.html',
  styleUrls: ['./winner-main.component.scss']
})
export class WinnerMainComponent {
  public activeContext = ActiveContext.Winner;
  public person;

  constructor(private personService: PersonService) {
    this.personService.me$.subscribe(person => this.person = person);
  }

}
