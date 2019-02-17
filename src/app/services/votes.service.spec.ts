import {TestBed} from '@angular/core/testing';

import {VotesService} from './votes.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {TestVoteList} from './data/votes.test.mock';

describe('VotesService', () => {
  let service: VotesService;
  let httpModule: HttpClientTestingModule;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
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
      id: 1,
      category_id: 17,
      nominee_id: 35,
      year: 2017,
      person_id: 1
    };

    service.addOrUpdateVote(mockVote).subscribe();
    const mockReq = httpMock.expectOne(service.votesUrl);
    expect(mockReq.request.method).toBe('PUT');
    expect(mockReq.request.body).toBe(mockVote);

    httpMock.verify();
  });

  it('getVoteForCategory', () => {
    service.getVoteForCategory(2, 2017, 1).subscribe((vote) => {
      expect(vote.nominee_id).toBe(4);
    });

    const testRequest = httpMock.expectOne(req => req.url === service.votesUrl);
    expect(testRequest.request.method).toBe('GET');
    expect(testRequest.request.params).toMatch('category_id=2');
    expect(testRequest.request.params).toMatch('year=2017');
    expect(testRequest.request.params).toMatch('person_id=1');
    testRequest.flush(TestVoteList[0]);

    httpMock.verify();
  });

});
