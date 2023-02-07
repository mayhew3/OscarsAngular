import {Component, OnInit} from '@angular/core';
import {CeremonyService} from '../../services/ceremony.service';
import {PersonService} from '../../services/person.service';
import _ from 'underscore';
import { inPlaceSort } from 'fast-sort';
import {BsModalService, ModalOptions} from 'ngx-bootstrap/modal';
import {AdminAddCeremonyPopupComponent} from '../admin-add-ceremony-popup/admin-add-ceremony-popup.component';
import {SystemVarsService} from '../../services/system.vars.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'osc-admin-ceremonies',
  templateUrl: './admin-ceremonies.component.html',
  styleUrls: ['./admin-ceremonies.component.scss']
})
export class AdminCeremoniesComponent implements OnInit {

  ceremonyYearsView?: CeremonyDisplay[];

  constructor(public ceremonyService: CeremonyService,
              private personService: PersonService,
              private ngxModalService: BsModalService,
              private systemVarsService: SystemVarsService) { }

  ngOnInit(): void {
    this.ceremonyService.ceremonies.subscribe(ceremonies => {
        const unsorted = _.flatten(_.map(ceremonies, ceremony => {
            return _.map(ceremony.ceremonyYears, ceremonyYear => {
                return ({
                  year: ceremonyYear.year,
                  ceremonyName: ceremony.name,
                  numGroups: ceremonyYear.groupYears.length,
                  nominationCount: ceremonyYear.nominationCount,
                  ceremonyDate: ceremonyYear.ceremony_date,
                  ceremony_year_id: ceremonyYear.id
                });
              }
            );
          }
        ));
        inPlaceSort(unsorted).desc(categoryYear => categoryYear.ceremonyDate);
        this.ceremonyYearsView = unsorted;
      }
    );
  }

  get isAdmin(): boolean {
    return this.personService.isAdmin;
  }

  openAddCeremonyPopup(): void {
    const initialState: ModalOptions = {
      class: 'modal-sm'
    };
    this.ngxModalService.show(AdminAddCeremonyPopupComponent, initialState);
  }

  canActivate(ceremonyYear: CeremonyDisplay): Observable<boolean> {
    return this.isActive(ceremonyYear).pipe(
      map(isActive => isActive && ceremonyYear.nominationCount > 0)
    );
  }

  isActive(ceremonyYear: CeremonyDisplay): Observable<boolean> {
    return this.systemVarsService.systemVarsCeremonyYearChanges$.pipe(
      map(systemVars => systemVars.ceremony_year_id === ceremonyYear.ceremony_year_id)
    );
  }

  async changeActiveCeremonyYear(ceremony_year_id: number): Promise<void> {
    await this.systemVarsService.changeActiveCeremonyYear(ceremony_year_id);
  }
}

interface CeremonyDisplay {
  year: number;
  ceremonyName: string;
  ceremony_year_id: number;
  numGroups: number;
  nominationCount: number;
  ceremonyDate: Date;
}
