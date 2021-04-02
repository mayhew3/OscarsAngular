import {Winner} from '../interfaces/Winner';
import {SocketService} from '../services/socket.service';

export class GetCategories {
  static readonly type = '[Category] Get';
  constructor(public year: number,
              public person_id: number,
              public socket: SocketService) {
  }
}

export class AddWinner {
  static readonly type = '[Category] Add Winner';
  constructor(public nomination_id: number,
              public winner_id: number,
              public declared: Date) {
  }
}

export class RemoveWinner {
  static readonly type = '[Category] Remove Winner';
  constructor(public winner_id: number) {
  }
}

export class ResetWinners {
  static readonly type = '[Category] Reset Winners';
  constructor(public year: number) {
  }
}

export interface OddsChange {
  nomination_id: number;
  odds_expert: number;
  odds_user: number;
  odds_numerator: number;
  odds_denominator: number;
}

export class UpdateOdds {
  static readonly type = '[Category] Update Odds';
  constructor(public changes: OddsChange[]) {
  }
}
