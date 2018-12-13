import {Component, Input, OnInit} from '@angular/core';
import {Nominee} from '../../interfaces/Nominee';

@Component({
  selector: 'app-nominees',
  templateUrl: './nominees.component.html',
  styleUrls: ['./nominees.component.scss']
})
export class NomineesComponent implements OnInit {
  @Input() nominees: Nominee[];

  constructor() { }

  ngOnInit() {
  }

}
