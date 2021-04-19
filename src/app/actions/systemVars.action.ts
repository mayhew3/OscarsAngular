export class GetSystemVars {
  static readonly type = '[SystemVars] Get';
}

export class VotingLock {
  static readonly type = '[SystemVars] Voting Lock';
}

export class VotingUnlock {
  static readonly type = '[SystemVars] Voting Unlock';
}

export class ChangeCurrentYear {
  static readonly type = '[SystemVars] Change Current Year';
  constructor(public year: number) {
  }
}

export class ToggleHideWinners {
  static readonly type = '[SystemVars] Toggle Hide Winners';
}

export class ToggleHideWinnerless {
  static readonly type = '[SystemVars] Toggle Hide Winnerless';
}
