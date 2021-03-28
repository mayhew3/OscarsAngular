import {Odds} from './Odds';

export interface OddsBundle {
  id: number;
  event_id: number;
  odds: Odds[];
}
