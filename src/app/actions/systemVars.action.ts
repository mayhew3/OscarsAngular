export class GetSystemVars {
  static readonly type = '[SystemVars] Get';
}

export class VotingLock {
  static readonly type = '[SystemVars] Voting Lock';
}

export class VotingUnlock {
  static readonly type = '[SystemVars] Voting Unlock';
}

export class ChangeActiveCeremonyYear {
  static readonly type = '[SystemVars] Change Active Ceremony Year';
  constructor(public ceremony_year_id: number,
              public year: number,
              public ceremony_name: string) {
  }
}

export class ToggleHideWinners {
  static readonly type = '[SystemVars] Toggle Hide Winners';
}

export class ToggleHideWinnerless {
  static readonly type = '[SystemVars] Toggle Hide Winnerless';
}
