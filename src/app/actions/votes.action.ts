
export class GetVotes {
  static readonly type = '[Vote] Get';
  constructor(public year: number) {
  }
}

export class AddVote {
  static readonly type = '[Vote] Add Vote';
  constructor(public vote_id: number,
              public category_id: number,
              public year: number,
              public person_id: number,
              public nomination_id: number) {
  }
}

export class ChangeVote {
  static readonly type = '[Vote] Change Vote';
  constructor(public vote_id: number,
              public nomination_id: number) {
  }
}

