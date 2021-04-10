import {Component, Inject, OnInit} from '@angular/core';
import {MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';

@Component({
  selector: 'osc-error-notification',
  templateUrl: './error-notification.component.html',
  styleUrls: ['./error-notification.component.scss']
})
export class ErrorNotificationComponent implements OnInit {

  header: string;
  message: string;

  constructor(@Inject(MAT_SNACK_BAR_DATA) private data: any) {
    this.header = data.header;
    this.message = data.message;
  }

  ngOnInit(): void {
  }

}
