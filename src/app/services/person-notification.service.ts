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

  connectedMap = new Map<number, number>();

  constructor(private snackBar: MatSnackBar,
              private screenModeService: ScreenModeService,
              private notificationService: NotificationService) {
  }

  maybeShowDelayedPersonSnackbar(person: Person, connected: boolean): void {
    if (connected) {
      const timeoutId = this.connectedMap.get(person.id);
      if (!timeoutId) {
        this.showPersonSnackbar(person, connected);
      } else {
        clearTimeout(timeoutId);
        this.connectedMap.delete(person.id);
      }
    } else {
      const timeoutId = setTimeout(() => {
        this.showPersonSnackbar(person, connected);
        this.connectedMap.delete(person.id);
      }, 10000);
      this.connectedMap.set(person.id, timeoutId);
    }
  }

  showPersonSnackbar(person: Person, connected: boolean): void {
    this.notificationService.addToMessageQueue(() => {
      const panelClasses = ['playerConnectSnackBar'];
      if (this.screenModeService.isMobile()) {
        panelClasses.push('mobileSnackBar');
      }
      return this.snackBar.openFromComponent(PersonConnectionSnackBarComponent,  {
        duration: 3000,
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
