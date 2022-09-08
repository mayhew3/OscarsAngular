import {Component, Inject, OnInit} from '@angular/core';
import {MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';
import {Person} from '../../interfaces/Person';
import {PersonService} from '../../services/person.service';
import {Observable} from 'rxjs';
import {NotificationComponent} from '../notification/notification/notification.component';

@Component({
  selector: 'osc-person-connection-snack-bar',
  templateUrl: './person-connection-snack-bar.component.html',
  styleUrls: ['./person-connection-snack-bar.component.scss']
})
export class PersonConnectionSnackBarComponent extends NotificationComponent implements OnInit {

  person: Person;
  connected: boolean;

  constructor(@Inject(MAT_SNACK_BAR_DATA) data: any,
              private personService: PersonService) {
    super(data);
    this.person = data.person;
    this.connected = data.connected;
  }

  ngOnInit(): void {
  }

  get personDisplayName(): Observable<string> {
    return this.personService.getPersonName(this.person);
  }

  get connectString(): string {
    return !!this.connected ? 'connected' : 'disconnected';
  }

  get connectClass(): string {
    return !!this.connected ? 'connectedText' : 'disconnectedText';
  }
}
