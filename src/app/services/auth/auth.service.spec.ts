/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MyAuthService } from './my-auth.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('MyAuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        MyAuthService,
        {
          provide: Router, useValue: { navigate: () => {} }
        }]
    });
  });

  it('should ...', inject([MyAuthService], (service: MyAuthService) => {
    expect(service).toBeTruthy();
  }));
});
