import {Component, OnInit} from '@angular/core';
import {SystemVarsService} from '../../services/system.vars.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'osc-front-page-logo',
  templateUrl: './front-page-logo.component.html',
  styleUrls: ['./front-page-logo.component.scss']
})
export class FrontPageLogoComponent implements OnInit {

  constructor(public systemVarsService: SystemVarsService) { }

  ngOnInit(): void {
  }

  get ceremonyName(): Observable<string> {
    return this.systemVarsService.systemVarsCeremonyYearChanges$.pipe(
      map(systemVars => systemVars.ceremony_name)
    );
  }

  get frontPageLogo(): Observable<string> {
    return this.ceremonyName.pipe(
      map(ceremonyName => ceremonyName === 'Oscars' ? 'front_logo' : 'front_logo_emmys')
    );
  }

  get ceremonyYear(): Observable<number> {
    return this.systemVarsService.systemVarsCeremonyYearChanges$.pipe(
      map(systemVars => systemVars.curr_year)
    );
  }
}
