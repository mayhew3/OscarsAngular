import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ErrorNotificationComponent} from '../components/error-notification/error-notification.component';
import {ScreenModeService} from './screen-mode.service';
import {NotificationService} from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorNotificationService {

  constructor(private snackBar: MatSnackBar,
              private screenModeService: ScreenModeService,
              private notificationService: NotificationService) {
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

  handleAPIErrorPromise<T>(error: any): void {
    this.notificationService.addToMessageQueue(() => {
      const panelClasses = ['redSnackBar'];
      if (this.screenModeService.isMobile()) {
        panelClasses.push('mobileSnackBar');
      }
      return this.snackBar.openFromComponent(ErrorNotificationComponent, {
        duration: 3000,
        panelClass: panelClasses,
        data: {
          header: 'API Error',
          message: ErrorNotificationService.getMessage(error)
        }
      });
    });
  }

}
