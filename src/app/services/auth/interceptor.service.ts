import { Injectable } from '@angular/core';
import _ from 'underscore';

import {HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';


import { Observable, throwError } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';
import {AuthService} from '@auth0/auth0-angular';
import {PublicGETs} from '../api.service';

@Injectable({
  providedIn: 'root'
})

export class InterceptorService implements HttpInterceptor {

  constructor(private auth: AuthService) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    console.log(req.url);

    if(this.isPublicURL(req.url) && req.method === 'GET'){
      return next.handle(req);
    }

    return this.auth.getAccessTokenSilently().pipe(
      mergeMap(token => {
        const tokenReq = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
        return next.handle(tokenReq);
      }),
      catchError(err => throwError(err))
    );
  }

  private isPublicURL(url: string): boolean {
    const fullPaths = _.map(PublicGETs, get => `/api/${get}`);
    return _.contains(fullPaths, url);
  }
}
