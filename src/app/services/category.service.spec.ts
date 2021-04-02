/* tslint:disable */
import {TestBed} from '@angular/core/testing';
/* tslint:disable quotemark */
import {CategoryService} from './category.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {TestCategoryList} from './data/categories.test.mock';
import {MyAuthService} from './auth/my-auth.service';
import {AuthServiceStub} from './auth/auth.service.stub';
import {SystemVarsService} from './system.vars.service';
import {SystemVarsServiceStub} from './system.vars.service.stub';
import {VotesService} from './votes.service';
import {VotesServiceStub} from './votes.service.stub';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpModule: HttpClientTestingModule;
  let httpMock: HttpTestingController;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [
      {provide: MyAuthService, useClass: AuthServiceStub},
      {provide: SystemVarsService, useClass: SystemVarsServiceStub},
      {provide: VotesService, useClass: VotesServiceStub}
    ]
  }));

  beforeEach(() => {
    service = TestBed.get(CategoryService);
    httpModule = TestBed.get(HttpClientTestingModule);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // everything that requires getCategories after this

  describe('CategoryService tests that require maybeUpdateCache', () => {

    it('getCategories calls http get if cache is empty', () => {
      service.categories.subscribe((categories) => {
        expect(categories).toBeTruthy();
        expect(categories.length).toBe(3);
      });
    });

    it('getCategory puts things in cache', () => {
      service.getCategory(2).subscribe((category) => {
        expect(category.id).toBe(2);
      });
    });

    it('getCategory returns nothing if id doesn\'t exist', () => {
      service.getCategory(5).subscribe((category) => {
        expect(category).toBeFalsy();
      });
    });

    it('getNextCategory returns next category if exists', () => {
      service.getNextCategory(1).subscribe((category) => {
        expect(category.id).toBe(2);
      });
    });

    it('getNextCategory returns nothing if there is none', () => {
      service.getNextCategory(17).subscribe((category) => {
        expect(category).toBeFalsy();
      });
    });

    it('getNextCategory returns nothing if id argument is not a category', () => {
      service.getNextCategory(25).subscribe((category) => {
        expect(category).toBeFalsy();
      });
    });

    it('getPreviousCategory returns next category if exists', () => {
      service.getPreviousCategory(2).subscribe((category) => {
        expect(category.id).toBe(1);
      });
    });

    it('getPreviousCategory returns nothing if there is none', () => {
      service.getPreviousCategory(1).subscribe((category) => {
        expect(category).toBeFalsy();
      });
    });

    it('getPreviousCategory returns nothing if id argument is not a category', () => {
      service.getPreviousCategory(25).subscribe((category) => {
        expect(category).toBeFalsy();
      });
    });

    it('getNominees returns nominees for a category', () => {
      service.getNominees(1).subscribe((nominees) => {
        expect(nominees).toBeTruthy();
        expect(nominees.length).toBe(3);
      });
    });

    it('getNominees returns nothing for a category that doesn\'t exist', () => {
      service.getNominees(25).subscribe((nominees) => {
        expect(nominees).toBeTruthy();
        expect(nominees.length).toBe(0);
      });
    });

  });

});
