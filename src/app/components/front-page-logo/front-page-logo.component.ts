import { Component, OnInit } from '@angular/core';
import {SystemVarsService} from '../../services/system.vars.service';

@Component({
  selector: 'osc-front-page-logo',
  templateUrl: './front-page-logo.component.html',
  styleUrls: ['./front-page-logo.component.scss']
})
export class FrontPageLogoComponent implements OnInit {

  constructor(public systemVarsService: SystemVarsService) { }

  ngOnInit(): void {
  }

}
