export interface Person {
  id: number;
  last_name: string;
  first_name: string;
  middle_name?: string;
  role: string;
  email: string;
  odds_filter: string;
  groups: number[];
  num_votes?: number;
}
