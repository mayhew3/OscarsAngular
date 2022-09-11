import {Component, Inject, OnInit} from '@angular/core';
import {MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';
import {NotificationComponent} from '../notification/notification/notification.component';

@Component({
  selector: 'osc-error-notification',
  templateUrl: './error-notification.component.html',
  styleUrls: ['./error-notification.component.scss']
})
export class ErrorNotificationComponent extends NotificationComponent implements OnInit {

  header: string;
  message: string;

  constructor(@Inject(MAT_SNACK_BAR_DATA) data: any) {
    super(data);
    this.header = data.header;
    this.message = data.message;
  }

  ngOnInit(): void {
  }

}
