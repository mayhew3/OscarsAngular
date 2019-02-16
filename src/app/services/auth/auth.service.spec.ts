/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        {
          provide: Router, useValue: { navigate: () => {} }
        }]
    });
  });

  it('should ...', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));
});
