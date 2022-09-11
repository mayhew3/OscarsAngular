import {SystemVars} from '../../interfaces/SystemVars';
import moment from 'moment';

export const MockSystemVars: SystemVars[] = [
  {
    id: 1,
    curr_year: 2022,
    voting_open: true,
    ceremony_name: 'Emmys',
    ceremony_year_id: 19,
    ceremony_id: 1,
    ceremony_start: moment.utc('2022-09-12 23:00').toDate()
  }
];
