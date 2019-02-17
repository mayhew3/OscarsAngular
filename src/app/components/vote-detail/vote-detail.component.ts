import { Component, OnInit } from '@angular/core';
import {ActiveContext} from '../categories.context';

@Component({
  selector: 'osc-vote-detail',
  templateUrl: './vote-detail.component.html',
  styleUrls: ['./vote-detail.component.scss']
})
export class VoteDetailComponent implements OnInit {
  public activeContext = ActiveContext.Vote;

  constructor() { }

  ngOnInit() {
  }

}
