import {Nominee} from './Nominee';
import {Winner} from './Winner';
import * as _ from 'underscore';
import {ArrayUtil} from '../utility/ArrayUtil';

export class Category {
  id: number;
  name: string;
  points: number;
  nominees: Nominee[];
  voted_on?: number;
  winners: Winner[];

  // noinspection JSMethodCanBeStatic
  getWinnerForNominee(nomination_id: number): Winner {
    return _.findWhere(this.winners, {nomination_id});
  }

  addWinner(winner: Winner): void {
    const existingWinner = this.getWinnerForNominee(winner.nomination_id);
    if (!existingWinner) {
      this.winners.push(winner);
    }
  }

  removeWinner(nomination_id: number): void {
    const winner = this.getWinnerForNominee(nomination_id);
    ArrayUtil.removeFromArray(this.winners, winner);
  }

}
