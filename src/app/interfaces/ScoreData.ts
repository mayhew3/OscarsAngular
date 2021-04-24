import {Person} from './Person';
import {Odds} from './Odds';

export class ScoreData {
  maxPosition: number;

  constructor(public person: Person,
              public score: number,
              public num_votes: number,
              public odds: Odds,
              public previousOdds: Odds,
              public latestVoteDate: Date) {
  }
}
