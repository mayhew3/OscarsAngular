import {GroupYear} from './GroupYear';

export interface CeremonyYear {
  id: number;
  ceremony_date: any;
  year: number;
  voting_closed?: any;
  ceremony_id: number;
  groupYears: GroupYear[];
  nominationCount: number;
}
