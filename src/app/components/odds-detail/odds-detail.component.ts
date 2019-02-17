import { Component, OnInit } from '@angular/core';
import {ActiveContext} from '../categories.context';

@Component({
  selector: 'osc-odds-detail',
  templateUrl: './odds-detail.component.html',
  styleUrls: ['./odds-detail.component.scss']
})
export class OddsDetailComponent implements OnInit {
  public activeContext = ActiveContext.OddsAssignment;

  constructor() { }

  ngOnInit() {
  }

}
