import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ScreenModeService} from './screen-mode.service';
import {NotificationService} from './notification.service';
import {Person} from '../interfaces/Person';
import {PersonConnectionSnackBarComponent} from '../components/person-connection-snack-bar/person-connection-snack-bar.component';

@Injectable({
  providedIn: 'root'
})
export class PersonNotificationService {

  constructor(private snackBar: MatSnackBar,
              private screenModeService: ScreenModeService,
              private notificationService: NotificationService) {
  }

  showPersonSnackbar(person: Person, connected: boolean): void {
    this.notificationService.addToMessageQueue(() => {
      const panelClasses = ['playerConnectSnackBar'];
      if (this.screenModeService.isMobile()) {
        panelClasses.push('mobileSnackBar');
      }
      return this.snackBar.openFromComponent(PersonConnectionSnackBarComponent,  {
        duration: 10000,
        panelClass: panelClasses,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        data: {
          person,
          connected
        }
      });
    });
  }
}
