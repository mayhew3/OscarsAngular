import {CeremonyYear} from './CeremonyYear';

export interface Ceremony {
  id: number;
  name: string;
  ceremonyYears: CeremonyYear[];
}
