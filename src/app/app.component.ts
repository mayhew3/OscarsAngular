import {Component} from '@angular/core';
import {SystemVarsService} from './services/system.vars.service';
import {CategoryService} from './services/category.service';
import {SocketService} from './services/socket.service';
import {MyAuthService} from './services/auth/my-auth.service';
import {PersonService} from './services/person.service';
import {MessagingService} from './services/messaging.service';
import {InitSocketService} from './services/init-socket.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ConnectionProblemComponent} from './components/connection-problem/connection-problem.component';

@Component({
  selector: 'osc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(public auth: MyAuthService,
              public systemVarsService: SystemVarsService,
              private categoryService: CategoryService,
              private socket: SocketService,
              private initSocket: InitSocketService,
              private personService: PersonService,
              private modalService: NgbModal,
              private messagingService: MessagingService) {
    personService.me$.subscribe();
    this.initDisconnectPopup();
  }

  initDisconnectPopup(): void {
    this.socket.on('disconnect', () => {
      const modalRef = this.modalService.open(ConnectionProblemComponent, {
        size: 'lg',
        backdrop: 'static',
        keyboard: false
      });
      const closeModal: (() => void) = () => {
        modalRef.close();
        this.socket.off('connect', closeModal);
      };
      this.socket.on('connect', closeModal);
    });
  }

  stillLoading(): boolean {
    return this.systemVarsService.stillLoading();
  }

  showHealthySocketStatus(): boolean {
    return this.personService.isAdmin;
  }

  socketConnected(): boolean {
    return this.socket.isConnected();
  }
}

