import {Nominee} from './Nominee';

export class Category {
  id: number;
  name: string;
  points: number;
  nominees: Nominee[];
}
