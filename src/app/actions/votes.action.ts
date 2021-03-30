
export class GetVotes {
  static readonly type = '[Vote] Get';
  constructor(public year: number) {
  }
}

export class AddVote {
  static readonly type = '[Vote] Add Vote';
  constructor(public category_id: number,
              public year: number,
              public person_id: number,
              public nomination_id: number,
              public submitted: Date) {
  }
}

export class ChangeVote {
  static readonly type = '[Vote] Change Vote';
  constructor(public category_id: number,
              public year: number,
              public person_id: number,
              public nomination_id: number,
              public submitted: Date) {
  }
}

