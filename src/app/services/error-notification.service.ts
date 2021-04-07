import { Injectable } from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorNotificationService {

  constructor(private snackBar: MatSnackBar) { }

  handleError<T>(result?: T) {
    return (error: any): Observable<T> => {
      this.snackBar.open(error.body.error);
      return of(result as T);
    };
  }

}
