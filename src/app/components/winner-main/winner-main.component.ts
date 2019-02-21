import { Component, OnInit } from '@angular/core';
import {ActiveContext} from '../categories.context';

@Component({
  selector: 'osc-winner-main',
  templateUrl: './winner-main.component.html',
  styleUrls: ['./winner-main.component.scss']
})
export class WinnerMainComponent implements OnInit {
  public activeContext = ActiveContext.Winner;

  constructor() { }

  ngOnInit() {
  }

}
