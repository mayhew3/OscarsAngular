import {OddsBundle} from '../interfaces/OddsBundle';

export class GetOdds {
  static readonly type = '[Odds] Get';
}

export class UpdatePlayerOdds {
  static readonly type = '[Odds] Update';
  constructor(public oddsBundle: OddsBundle) {
  }
}

export class OddsInProgress {
  static readonly type = '[Odds] In Progress';
}
