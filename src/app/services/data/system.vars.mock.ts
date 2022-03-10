import {SystemVars} from '../../interfaces/SystemVars';
import moment from 'moment';

export const MockSystemVars: SystemVars[] = [
  {
    id: 1,
    curr_year: 2021,
    voting_open: false,
    ceremony_name: 'Emmys',
    ceremony_year_id: 14,
    ceremony_start: moment.utc('2022-03-27 23:00').toDate()
  }
];
