
export class GetCategories {
  static readonly type = '[Category] Get';
  constructor(public year: number,
              public person_id: number) {
  }
}
