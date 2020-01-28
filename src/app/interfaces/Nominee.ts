import {Category} from './Category';

export class Nominee {
  static singleLineCategories = ['Best Picture', 'Documentary Feature', 'Documentary Short', 'Short Film (Animated)', 'Short Film (Live Action)', 'Animated Feature'];
  static songCategories = ['Music (Original Song)'];

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

  static isSingleLineCategory(categoryName: string): boolean {
    return Nominee.singleLineCategories.includes(categoryName);
  }

  static isSongCategory(categoryName: string): boolean {
    return Nominee.songCategories.includes(categoryName);
  }

  static getSubtitleText(category: Category, nominee: Nominee): string {
    if (Nominee.isSingleLineCategory(category.name)) {
      return undefined;
    } else if (nominee.nominee === nominee.context) {
      return nominee.detail;
    } else {
      return nominee.context;
    }
  }

}
