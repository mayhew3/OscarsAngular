import {Component} from '@angular/core';
import {CategoryService} from './services/category.service';
import {SocketService} from './services/socket.service';
import {MyAuthService} from './services/auth/my-auth.service';
import {PersonService} from './services/person.service';
import {MessagingService} from './services/messaging.service';
import {InitSocketService} from './services/init-socket.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ConnectionProblemComponent} from './components/connection-problem/connection-problem.component';
import {ThemePalette} from '@angular/material/core';
import {Observable} from 'rxjs';
import {ApiService} from './services/api.service';
import {Title} from '@angular/platform-browser';
import {CeremonyStyleService} from './services/ceremony-style.service';
import {CeremonyService} from './services/ceremony.service';

@Component({
  selector: 'osc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  authenticatingColor: ThemePalette = 'primary';
  loadingColor: ThemePalette = 'accent';

  constructor(public auth: MyAuthService,
              private messagingService: MessagingService,
              private ceremonyService: CeremonyService,
              private categoryService: CategoryService,
              private socket: SocketService,
              private initSocket: InitSocketService,
              private personService: PersonService,
              private apiService: ApiService,
              private ceremonyStyleService: CeremonyStyleService,
              private modalService: NgbModal,
              private titleService: Title) {
    this.initDisconnectPopup();
    this.ceremonyService.getCurrentCeremonyName().subscribe(ceremonyName => this.titleService.setTitle(ceremonyName));
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

  get emailVerified$(): Observable<boolean> {
    return this.apiService.emailVerified$;
  }

  get failedEmail(): boolean {
    return this.personService.failedEmail;
  }

}

