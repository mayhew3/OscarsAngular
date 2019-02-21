import { Component, OnInit } from '@angular/core';
import {ActiveContext} from '../categories.context';

@Component({
  selector: 'osc-winner-detail',
  templateUrl: './winner-detail.component.html',
  styleUrls: ['./winner-detail.component.scss']
})
export class WinnerDetailComponent implements OnInit {
  public activeContext = ActiveContext.Winner;

  constructor() { }

  ngOnInit() {
  }

}
