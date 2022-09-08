import {Component, OnInit} from '@angular/core';
import {MyAuthService} from '../../services/auth/my-auth.service';
import {SystemVarsService} from '../../services/system.vars.service';
import {map, mergeMap} from 'rxjs/operators';
import {combineLatest, Observable} from 'rxjs';
import {CeremonyService} from '../../services/ceremony.service';
import {PersonService} from '../../services/person.service';

@Component({
  selector: 'osc-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  constructor(public auth: MyAuthService,
              public systemVarsService: SystemVarsService,
              private ceremonyService: CeremonyService,
              private personService: PersonService) { }

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
    return combineLatest([this.personService.me$, this.systemVarsService.systemVarsCeremonyYearChanges$]).pipe(
      mergeMap(([me, systemVars]) => this.ceremonyService.hasPastCeremonies(me, systemVars.ceremony_id))
    );
  }
}
