import { Component, OnInit } from '@angular/core';
import {CeremonyService} from '../../services/ceremony.service';
import {PersonService} from '../../services/person.service';
import {Observable} from 'rxjs';
import _ from 'underscore';
import {map} from 'rxjs/operators';

@Component({
  selector: 'osc-admin-ceremonies',
  templateUrl: './admin-ceremonies.component.html',
  styleUrls: ['./admin-ceremonies.component.scss']
})
export class AdminCeremoniesComponent implements OnInit {


  constructor(public ceremonyService: CeremonyService,
              private personService: PersonService) { }

  ngOnInit(): void {
  }

  get isAdmin(): boolean {
    return this.personService.isAdmin;
  }

  get ceremonyYearsView(): Observable<CeremonyDisplay[]> {
    return this.ceremonyService.ceremonies.pipe(
      map(ceremonies => _.flatten(_.map(ceremonies, ceremony => _.map(ceremony.ceremonyYears, ceremonyYear => ({
            year: ceremonyYear.year,
            ceremonyName: ceremony.name,
            numGroups: ceremonyYear.groupYears.length
          })
      ))))
    );
  }

}

interface CeremonyDisplay {
  year: number;
  ceremonyName: string;
  numGroups: number;
}
