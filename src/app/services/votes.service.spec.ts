import {TestBed} from '@angular/core/testing';

import {VotesService} from './votes.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {TestVoteList} from './data/votes.test.mock';
import {TestCategoryList} from './data/categories.test.mock';
import {TestPersonList} from './data/persons.test.mock';
import {SystemVarsService} from './system.vars.service';
import {SystemVarsServiceStub} from './system.vars.service.stub';
import {CategoryService} from './category.service';
import {CategoryServiceStub} from './category.service.stub';

describe('VotesService', () => {
  let service: VotesService;
  let httpModule: HttpClientTestingModule;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {provide: SystemVarsService, useClass: SystemVarsServiceStub}
      ]
    });
  });

  beforeEach(() => {
    service = TestBed.get(VotesService);
    httpModule = TestBed.get(HttpClientTestingModule);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('addOrUpdateVote calls http put', () => {
    const mockVote = {
      category_id: 2,
      nomination_id: 2287,
      person_id: 18,
      year: 2017
    };

    service.addOrUpdateVote(TestCategoryList[1].nominees[1], TestPersonList[0]).subscribe();
    const mockReq = httpMock.expectOne(service.votesUrl);
    expect(mockReq.request.method).toBe('POST');
    expect(mockReq.request.body).toEqual(mockVote);

    httpMock.verify();
  });

});
