import {Nominee} from './Nominee';
import {Winner} from './Winner';

export interface Category {
  id: number;
  name: string;
  points: number;
  nominees: Nominee[];
  voted_on?: number;
  winners: Winner[];
}
