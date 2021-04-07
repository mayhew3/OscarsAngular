import { Injectable } from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Observable, of} from 'rxjs';
import {ErrorNotificationComponent} from '../components/error-notification/error-notification.component';

@Injectable({
  providedIn: 'root'
})
export class ErrorNotificationService {

  constructor(private snackBar: MatSnackBar) { }

  private static getMessage(error: any): string {
    if (!!error.error) {
      return error.error.message;
    } else if (!!error.message) {
      return error.message;
    } else if (!!error.body) {
      return error.body.error;
    } else {
      return JSON.stringify(error);
    }
  }

  handleAPIError<T>(result?: T) {
    return (error: any): Observable<T> => {
      this.snackBar.openFromComponent(ErrorNotificationComponent,  {
        duration: 3000,
        panelClass: ['redSnackBar'],
        data: {
          header: 'API Error',
          message: ErrorNotificationService.getMessage(error)
        }
      });
      return of(result as T);
    };
  }

}
