import { Component, OnInit } from '@angular/core';
import {CeremonyService} from '../../services/ceremony.service';
import {PersonService} from '../../services/person.service';
import {Observable} from 'rxjs';
import _ from 'underscore';
import fast_sort from 'fast-sort';
import {map} from 'rxjs/operators';
import {BsModalService, ModalOptions} from 'ngx-bootstrap/modal';
import {AdminAddCeremonyPopupComponent} from '../admin-add-ceremony-popup/admin-add-ceremony-popup.component';

@Component({
  selector: 'osc-admin-ceremonies',
  templateUrl: './admin-ceremonies.component.html',
  styleUrls: ['./admin-ceremonies.component.scss']
})
export class AdminCeremoniesComponent implements OnInit {


  constructor(public ceremonyService: CeremonyService,
              private personService: PersonService,
              private ngxModalService: BsModalService) { }

  ngOnInit(): void {
  }

  get isAdmin(): boolean {
    return this.personService.isAdmin;
  }

  get ceremonyYearsView(): Observable<CeremonyDisplay[]> {
    return this.ceremonyService.ceremonies.pipe(
      map(ceremonies => {
          const unsorted = _.flatten(_.map(ceremonies, ceremony => {
              return _.map(ceremony.ceremonyYears, ceremonyYear => {
                  return ({
                    year: ceremonyYear.year,
                    ceremonyName: ceremony.name,
                    numGroups: ceremonyYear.groupYears.length,
                    nominationCount: ceremonyYear.nominationCount,
                    ceremonyDate: ceremonyYear.ceremony_date,
                  });
                }
              );
            }
          ));
          fast_sort(unsorted).desc(categoryYear => categoryYear.ceremonyDate);
          return unsorted;
        }
      )
    );
  }

  openAddCeremonyPopup(): void {
    const initialState: ModalOptions = {
      class: 'modal-sm'
    };
    this.ngxModalService.show(AdminAddCeremonyPopupComponent, initialState);
  }

}

interface CeremonyDisplay {
  year: number;
  ceremonyName: string;
  numGroups: number;
  nominationCount: number;
  ceremonyDate: Date;
}
