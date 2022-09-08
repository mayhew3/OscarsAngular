import {Injectable} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {MatSnackBarRef} from '@angular/material/snack-bar';
import {NotificationComponent} from '../components/notification/notification/notification.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private messageQueue = new Subject<SnackBarMessage>();
  private subscription: Subscription;
  private snackBarRef: MatSnackBarRef<NotificationComponent>;

  constructor() {
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

  addToMessageQueue(snackBarMessage: SnackBarMessage): void {
    this.messageQueue.next(snackBarMessage);
  }

  private openSnackBar(snackBarMessage: SnackBarMessage): void {
    this.snackBarRef = snackBarMessage();
    this.snackBarRef.afterDismissed().subscribe(() => {
      this.snackBarRef = undefined;
    });
  }

}

export type SnackBarMessage = () => MatSnackBarRef<NotificationComponent>;
