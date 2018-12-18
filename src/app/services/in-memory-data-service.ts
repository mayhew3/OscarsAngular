import {InMemoryDbService, RequestInfo} from 'angular-in-memory-web-api';

export class InMemoryDataService implements InMemoryDbService {
  createDb(): {} {
    const nominees = [
      {
        id: 1,
        name: 'The Post',
        subtitle: null,
        odds: null,
        category_id: 1
      },
      {
        id: 2,
        name: 'Darkest Hour',
        subtitle: null,
        odds: null,
        category_id: 1
      },
      {
        id: 3,
        name: 'Dunkirk',
        subtitle: null,
        odds: null,
        category_id: 1
      },
      {
        id: 4,
        name: 'Get Out',
        subtitle: null,
        odds: null,
        category_id: 1
      },
      {
        id: 5,
        name: 'Lady Bird',
        subtitle: null,
        odds: null,
        category_id: 1
      },
      {
        id: 6,
        name: 'Phantom Thread',
        subtitle: null,
        odds: null,
        category_id: 1
      },
      {
        id: 7,
        name: 'The Shape of Water',
        subtitle: null,
        odds: null,
        category_id: 1
      },
      {
        id: 8,
        name: 'Three Billboards Outside Ebbing, Missouri',
        subtitle: null,
        odds: null,
        category_id: 1
      },
      {
        id: 9,
        name: 'Call Me By Your Name',
        subtitle: null,
        odds: null,
        category_id: 1
      },
      {
        id: 10,
        name: 'Gary Oldman',
        subtitle: 'Darkest Hour',
        odds: null,
        category_id: 2
      },
      {
        id: 11,
        name: 'Daniel Kaluuya',
        subtitle: 'Get Out',
        odds: null,
        category_id: 2
      },
      {
        id: 12,
        name: 'Daniel Day-Lewis',
        subtitle: 'Phantom Thread',
        odds: null,
        category_id: 2
      },
      {
        id: 13,
        name: 'Timothee Chalamet',
        subtitle: 'Call Me By Your Name',
        odds: null,
        category_id: 2
      },
      {
        id: 14,
        name: 'Denzel Washington',
        subtitle: 'Roman J. Isreal, Esquire',
        odds: null,
        category_id: 2
      }
    ];
    const categories = [
      {
        id: 1,
        name: 'Picture',
        points: 5
      },
      {
        id: 2,
        name: 'Actor',
        points: 4
      }
    ];
    return {categories, nominees};
  }

  put(reqInfo: RequestInfo) {
    console.log('HTTP override: PUT');
    return undefined;
  }

}
