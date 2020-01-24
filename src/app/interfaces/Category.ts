import {Nominee} from './Nominee';
import {Winner} from './Winner';

export class Category {
  id: number;
  name: string;
  points: number;
  nominees: Nominee[];
  voted_on?: number;
  winners: Winner[];
}
