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

@Injectable({
  providedIn: 'root'
})

export class InterceptorService implements HttpInterceptor {

  readonly publicUrls = ['/api/systemVars', '/api/ceremonies'];

  constructor(private auth: AuthService) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    console.log(req.url);

    if(_.contains(this.publicUrls, req.url) && req.method === 'GET'){
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
}
