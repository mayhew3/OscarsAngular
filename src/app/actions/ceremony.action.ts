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

export class VotingLock {
  static readonly type = '[CeremonyYear] Voting Lock';
  constructor(public ceremony_year_id: number) {
  }
}

export class VotingUnlock {
  static readonly type = '[CeremonyYear] Voting Unlock';
  constructor(public ceremony_year_id: number) {
  }
}
