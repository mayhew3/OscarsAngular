import {Component, OnInit} from '@angular/core';
import {MyAuthService} from '../../services/auth/my-auth.service';
import {SystemVarsService} from '../../services/system.vars.service';
import {activeCeremony} from '../../../shared/GlobalVars';

@Component({
  selector: 'osc-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  constructor(public auth: MyAuthService,
              public systemVarsService: SystemVarsService) { }

  ngOnInit(): void {
  }

  get ceremonyName(): string {
    return activeCeremony;
  }

  get bannerImage(): string {
    // @ts-ignore
    return activeCeremony === 'Oscars' ? 'navbar_logo' : 'navbar_logo_emmys';
  }

  showPast(): boolean {
    // @ts-ignore
    return activeCeremony === 'Oscars';
  }
}
