import { TestBed } from '@angular/core/testing';

import { EventsService } from './events.service';
import {PersonService} from './person.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

describe('EventsService', () => {
  let service: EventsService;
  let httpModule: HttpClientTestingModule;
  let httpMock: HttpTestingController;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule]
  }));

  beforeEach(() => {
    service = TestBed.get(EventsService);
    httpModule = TestBed.get(HttpClientTestingModule);
    httpMock = TestBed.get(HttpTestingController);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
