import {Component, OnInit} from '@angular/core';
import {SystemVarsService} from './services/system.vars.service';
import {CategoryService} from './services/category.service';
import {SocketService} from './services/socket.service';
import {MyAuthService} from './services/auth/my-auth.service';

@Component({
  selector: 'osc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(public auth: MyAuthService,
              public systemVarsService: SystemVarsService,
              private categoryService: CategoryService,
              private socket: SocketService) {
    categoryService.getCategories().subscribe();
  }

  stillLoading() {
    return this.systemVarsService.stillLoading();
  }

  showHealthySocketStatus() {
    return this.auth.isAdmin();
  }

  socketConnected() {
    return this.socket.isConnected();
  }
}

