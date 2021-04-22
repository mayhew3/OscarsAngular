import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'osc-dot',
  templateUrl: './dot.component.html',
  styleUrls: ['./dot.component.scss']
})
export class DotComponent implements OnInit {

  @Input() filled: boolean;
  @Input() size: number;

  constructor() { }

  ngOnInit(): void {
  }

}
