import { Component, OnInit } from '@angular/core';
import {ActiveContext} from '../categories.context';

@Component({
  selector: 'osc-odds-main',
  templateUrl: './odds-main.component.html',
  styleUrls: ['./odds-main.component.scss']
})
export class OddsMainComponent implements OnInit {
  public activeContext = ActiveContext.OddsAssignment;

  constructor() { }

  ngOnInit() {
  }

}
