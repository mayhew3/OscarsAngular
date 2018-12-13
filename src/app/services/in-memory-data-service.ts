import { InMemoryDbService } from 'angular-in-memory-web-api';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class InMemoryDataService implements InMemoryDbService {
  createDb(): {} {
    const categories = [
      {
        id: 1,
        name: 'Picture',
        points: 5,
        nominees: [
          {
            name: 'The Post',
            subtitle: null,
            odds: null
          },
          {
            name: 'Darkest Hour',
            subtitle: null,
            odds: null
          },
          {
            name: 'Dunkirk',
            subtitle: null,
            odds: null
          },
          {
            name: 'Get Out',
            subtitle: null,
            odds: null
          },
          {
            name: 'Lady Bird',
            subtitle: null,
            odds: null
          },
          {
            name: 'Phantom Thread',
            subtitle: null,
            odds: null
          },
          {
            name: 'The Shape of Water',
            subtitle: null,
            odds: null
          },
          {
            name: 'Three Billboards Outside Ebbing, Missouri',
            subtitle: null,
            odds: null
          },
          {
            name: 'Call Me By Your Name',
            subtitle: null,
            odds: null
          }
        ]
      },
      {
        id: 2,
        name: 'Actor',
        points: 4,
        nominees: [
          {
            name: 'Gary Oldman',
            subtitle: 'Darkest Hour',
            odds: null
          },
          {
            name: 'Daniel Kaluuya',
            subtitle: 'Get Out',
            odds: null
          },
          {
            name: 'Daniel Day-Lewis',
            subtitle: 'Phantom Thread',
            odds: null
          },
          {
            name: 'Timothee Chalamet',
            subtitle: 'Call Me By Your Name',
            odds: null
          },
          {
            name: 'Denzel Washington',
            subtitle: 'Roman J. Isreal, Esquire',
            odds: null
          }
        ]
      }
    ];
    return {categories};
  }

}
