
export class GetSystemVars {
  static readonly type = '[SystemVars] Get';
}

export class ToggleVotingLock {
  static readonly type = '[SystemVars] Toggle Voting Lock';
}

export class ChangeCurrentYear {
  static readonly type = '[SystemVars] Change Current Year';
  constructor(public year: number) {
  }
}
