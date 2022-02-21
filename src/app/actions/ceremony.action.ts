import {CeremonyYear} from '../interfaces/CeremonyYear';

export class GetCeremonyYears {
  static readonly type = '[CeremonyYear] Get';
  constructor() {
  }
}

export class AddCeremonyYear {
  static readonly type = '[CeremonyYear] Add';
  constructor(public ceremonyYear: CeremonyYear) {
  }
}
