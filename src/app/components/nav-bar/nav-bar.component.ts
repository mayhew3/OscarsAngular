import {Component, OnInit} from '@angular/core';
import {MyAuthService} from '../../services/auth/my-auth.service';
import {SystemVarsService} from '../../services/system.vars.service';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';

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

  get ceremonyName(): Observable<string> {
    return this.systemVarsService.systemVarsCeremonyYearChanges$.pipe(
      map(systemVars => systemVars.ceremony_name)
    );
  }

  get bannerImage(): Observable<string> {
    return this.ceremonyName.pipe(
      map(ceremonyName => ceremonyName === 'Oscars' ? 'navbar_logo' : 'navbar_logo_emmys')
    );
  }

  showPast(): Observable<boolean> {
    return this.ceremonyName.pipe(
      map(ceremonyName => ceremonyName === 'Oscars')
    );
  }
}
