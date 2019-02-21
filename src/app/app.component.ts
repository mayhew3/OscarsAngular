import {Component, OnInit} from '@angular/core';
import {AuthService} from './services/auth/auth.service';
import {SystemVarsService} from './services/system.vars.service';

@Component({
  selector: 'osc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(public auth: AuthService,
              public systemVarsService: SystemVarsService) {
    auth.handleAuthentication();
    auth.scheduleRenewal();
  }

  ngOnInit() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      this.auth.renewTokens();
    }
  }

  stillLoading() {
    return this.auth.stillLoading() || this.systemVarsService.stillLoading();
  }
}

