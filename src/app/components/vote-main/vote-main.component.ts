import { Component, OnInit } from '@angular/core';
import {ActiveContext} from '../categories.context';

@Component({
  selector: 'osc-vote-main',
  templateUrl: './vote-main.component.html',
  styleUrls: ['./vote-main.component.scss']
})
export class VoteMainComponent implements OnInit {
  public activeContext = ActiveContext.Vote;

  constructor() { }

  ngOnInit(): void {
  }

}
