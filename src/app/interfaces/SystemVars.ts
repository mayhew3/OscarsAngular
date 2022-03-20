export interface SystemVars {
  id?: number;
  curr_year: number;
  voting_open: boolean;
  ceremony_name: string;
  ceremony_id: number;
  ceremony_year_id: number;
  ceremony_start: Date;
  hide_winners?: boolean;
  hide_winnerless?: boolean;
}
