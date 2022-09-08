import {Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarRef} from '@angular/material/snack-bar';
import {Observable, of, Subject, Subscription} from 'rxjs';
import {ErrorNotificationComponent} from '../components/error-notification/error-notification.component';
import {ScreenModeService} from './screen-mode.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorNotificationService {

  private messageQueue = new Subject<SnackBarMessage>();
  private subscription: Subscription;
  private snackBarRef: MatSnackBarRef<ErrorNotificationComponent>;

  constructor(private snackBar: MatSnackBar,
              private screenModeService: ScreenModeService) {
    this.subscription = this.messageQueue.subscribe(snackBarMessage => {
      if (!this.snackBarRef) {
        this.openSnackBar(snackBarMessage);
      } else {
        this.snackBarRef.afterDismissed().subscribe(() => {
          this.snackBarRef = undefined;
          this.openSnackBar(snackBarMessage);
        });
      }
    });
  }

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

  handleAPIError<T>(result?: T): (error: any) => Observable<T> {
    return (error: any): Observable<T> => {
      this.addToMessageQueue('API Error', ErrorNotificationService.getMessage(error));
      return of(result as T);
    };
  }

  handleAPIErrorPromise<T>(error: any): void {
    this.addToMessageQueue('API Error', ErrorNotificationService.getMessage(error));
  }

  private addToMessageQueue(header: string, message: string): void {
    const snackBarMessage = new SnackBarMessage(header, message);
    this.messageQueue.next(snackBarMessage);
  }

  private openSnackBar(snackBarMessage: SnackBarMessage): void {
    const panelClasses = ['redSnackBar'];
    if (this.screenModeService.isMobile()) {
      panelClasses.push('mobileSnackBar');
    }
    this.snackBarRef = this.snackBar.openFromComponent(ErrorNotificationComponent, {
      duration: 3000,
      panelClass: panelClasses,
      data: {
        header: snackBarMessage.header,
        message: ErrorNotificationService.getMessage(snackBarMessage.message)
      }
    });
    this.snackBarRef.afterDismissed().subscribe(() => {
      this.snackBarRef = undefined;
    });
  }

}

class SnackBarMessage {
  constructor(public header: string,
              public message: string) {
  }
}
