import { Component, OnInit } from '@angular/core';
import {ActiveContext} from '../categories.context';
import {AuthService} from '../../services/auth/auth.service';

@Component({
  selector: 'osc-winner-main',
  templateUrl: './winner-main.component.html',
  styleUrls: ['./winner-main.component.scss']
})
export class WinnerMainComponent implements OnInit {
  public activeContext = ActiveContext.Winner;
  public person;

  constructor(private auth: AuthService) {
    this.auth.getPerson().subscribe(person => this.person = person);
  }

  ngOnInit() {
  }

}
