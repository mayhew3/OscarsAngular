import {TestBed} from '@angular/core/testing';
/* tslint:disable quotemark */
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {PersonService} from './person.service';
import {TestPersonList} from './data/persons.test.mock';

describe('PersonService', () => {
  let service: PersonService;
  let httpModule: HttpClientTestingModule;
  let httpMock: HttpTestingController;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule]
  }));

  beforeEach(() => {
    service = TestBed.get(PersonService);
    httpModule = TestBed.get(HttpClientTestingModule);
    httpMock = TestBed.get(HttpTestingController);
  });

  function doFirstPersonsRequest() {
    const testRequest = httpMock.expectOne(service.personsUrl);
    expect(testRequest.request.method).toBe('GET');
    testRequest.flush(TestPersonList);

    httpMock.verify();
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('nothing in cache initially', () => {
    expect(service.cache).toBeTruthy();
    expect(service.cache.length).toBe(0);
  });

  it('getPersons doesn\'t call http get if there is a cache already', () => {
    // do an initial call to fill the cache
    service.getPersons().subscribe();

    doFirstPersonsRequest();

    // subsequent calls to getPersons should just use the cache and do no HTTP request
    service.getPersons().subscribe((persons) => {
      expect(persons).toBeTruthy();
      expect(persons.length).toBe(3);
    });

    httpMock.expectNone(service.personsUrl);

    httpMock.verify();
  });

  // everything that requires getPersons after this

  describe('PersonService tests that require maybeUpdateCache', () => {

    afterEach(() => {
      doFirstPersonsRequest();
    });

    it('getPersons calls http get if cache is empty', () => {
      service.getPersons().subscribe((persons) => {
        expect(persons).toBeTruthy();
        expect(persons.length).toBe(3);
      });
    });

    it('getPersons puts things in cache', () => {
      service.getPersons().subscribe((persons) => {
        expect(service.cache.length).toBeGreaterThan(0);
        expect(persons.length).toBeGreaterThan(0);
        expect(persons.length).toBe(service.cache.length);
        expect(persons.length).toBe(3);
      });
    });

    it('getPerson', () => {
      service.getPerson(41).subscribe((person) => {
        expect(person.id).toBe(41);
      });
    });

    it('getPerson returns nothing if id doesn\'t exist', () => {
      service.getPerson(5).subscribe((person) => {
        expect(person).toBeFalsy();
      });
    });

    it('getPersonWithEmail', () => {
      service.getPersonWithEmail('smp2as@gmail.com').subscribe((person) => {
        expect(person.id).toBe(41);
        expect(person.groups).toEqual([1]);
      });
    });

    it('getPersonWithEmail returns nothing if email doesn\'t exist', () => {
      service.getPersonWithEmail('fakeemail@gmail.com').subscribe((person) => {
        expect(person).toBeFalsy();
      });
    });

  });

});
