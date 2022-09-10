import {GroupYear} from './GroupYear';

export interface CeremonyYear {
  id: number;
  ceremony_date: Date;
  year: number;
  voting_closed?: Date;
  ceremony_id: number;
  groupYears: GroupYear[];
  nominationCount: number;
}
