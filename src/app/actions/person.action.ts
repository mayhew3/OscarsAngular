
export class GetPersons {
  static readonly type = '[Person] Get';
}

export class ChangeOddsView {
  static readonly type = '[Person] Change Odds View';
  constructor(public person_id: number,
              public odds_filter: string) {
  }
}
