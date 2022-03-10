import {Component, Inject, OnInit} from '@angular/core';
import {SystemVarsService} from './services/system.vars.service';
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
import {Person} from './interfaces/Person';
import {ApiService} from './services/api.service';
import {Title} from '@angular/platform-browser';
import {activeCeremony} from '../shared/GlobalVars';
import {DOCUMENT} from '@angular/common';

@Component({
  selector: 'osc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  authenticatingColor: ThemePalette = 'primary';
  loadingColor: ThemePalette = 'accent';

  constructor(public auth: MyAuthService,
              private messagingService: MessagingService,
              public systemVarsService: SystemVarsService,
              private categoryService: CategoryService,
              private socket: SocketService,
              private initSocket: InitSocketService,
              private personService: PersonService,
              private apiService: ApiService,
              private modalService: NgbModal,
              private titleService: Title,
              @Inject(DOCUMENT) private document: Document) {
    this.initDisconnectPopup();
    this.titleService.setTitle(activeCeremony);
  }

  ngOnInit(): void {
    this.loadStyle('oscars.css');
  }

  loadStyle(styleName: string): void {
    const head = this.document.getElementsByTagName('head')[0];

    const themeLink = this.document.getElementById(
      'client-theme'
    ) as HTMLLinkElement;
    if (themeLink) {
      themeLink.href = styleName;
    } else {
      const style = this.document.createElement('link');
      style.id = 'client-theme';
      style.rel = 'stylesheet';
      style.href = `${styleName}`;

      head.appendChild(style);
    }
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

