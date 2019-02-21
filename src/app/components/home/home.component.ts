import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth/auth.service';
import {SystemVarsService} from '../../services/system.vars.service';

@Component({
  selector: 'osc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(public auth: AuthService,
              public systemVarsService: SystemVarsService) { }

  ngOnInit() {
  }

  stillLoading(): boolean {
    return this.auth.stillLoading() || this.systemVarsService.stillLoading();
  }
}
