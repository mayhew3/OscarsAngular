export interface Nominee {
  id: number;
  nominee: string;
  context: string;
  detail: string;
  category_id: number;
  year: number;
  odds_expert?: number;
  odds_user?: number;
  odds_numerator?: number;
  odds_denominator?: number;

  original_odds_expert?: number;
  original_odds_user?: number;
  original_odds_numerator?: number;
  original_odds_denominator?: number;
}
