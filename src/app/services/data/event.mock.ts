import {Event} from '../../interfaces/Event';

export const MockEvents: Event[] = [
  {
    id: 1,
    type: 'winner',
    detail: 'add',
    nomination_id: 2788,
    event_time: new Date('2019-02-23 14:00:59')
  },
  {
    id: 2,
    type: 'winner',
    detail: 'delete',
    nomination_id: 2788,
    event_time: new Date('2019-02-23 15:00:59')
  },
  {
    id: 3,
    type: 'winner',
    detail: 'add',
    nomination_id: 2786,
    event_time: new Date('2019-02-23 16:00:59')
  }
];
