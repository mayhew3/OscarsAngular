import { InMemoryDbService } from 'angular-in-memory-web-api';

export class InMemoryDataService implements InMemoryDbService {
  createDb(): {} {
    const categories = [
      {
        name: 'Picture',
        points: 5,
        nominees: [
          {
            nominee: 'The Post',
            subtitle: null,
            odds: null
          },
          {
            nominee: 'Darkest Hour',
            subtitle: null,
            odds: null
          },
          {
            nominee: 'Dunkirk',
            subtitle: null,
            odds: null
          },
          {
            nominee: 'Get Out',
            subtitle: null,
            odds: null
          },
          {
            nominee: 'Lady Bird',
            subtitle: null,
            odds: null
          },
          {
            nominee: 'Phantom Thread',
            subtitle: null,
            odds: null
          },
          {
            nominee: 'The Shape of Water',
            subtitle: null,
            odds: null
          },
          {
            nominee: 'Three Billboards Outside Ebbing, Missouri',
            subtitle: null,
            odds: null
          },
          {
            nominee: 'Call Me By Your Name',
            subtitle: null,
            odds: null
          }
        ]
      },
      {
        name: 'Actor',
        points: 4,
        nominees: [
          {
            nominee: 'Gary Oldman',
            subtitle: 'Darkest Hour',
            odds: null
          },
          {
            nominee: 'Daniel Kaluuya',
            subtitle: 'Get Out',
            odds: null
          },
          {
            nominee: 'Daniel Day-Lewis',
            subtitle: 'Phantom Thread',
            odds: null
          },
          {
            nominee: 'Timothee Chalamet',
            subtitle: 'Call Me By Your Name',
            odds: null
          },
          {
            nominee: 'Denzel Washington',
            subtitle: 'Roman J. Isreal, Esquire',
            odds: null
          }
        ]
      }
    ];
    return {categories};
  }

}
