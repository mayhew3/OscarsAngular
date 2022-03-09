import { Component, OnInit } from '@angular/core';
import {SystemVarsService} from '../../services/system.vars.service';
import {activeCeremony} from '../../../shared/GlobalVars';
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

  get ceremonyName(): string {
    return activeCeremony;
  }

  get frontPageLogo(): string {
    // @ts-ignore
    return activeCeremony === 'Oscars' ? 'front_logo' : 'front_logo_emmys';
  }

  get ceremonyYear(): Observable<number> {
    return this.systemVarsService.systemVars.pipe(
      map(systemVars => systemVars.curr_year)
    );
  }
}
