import { Component, OnInit } from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap/modal';
import {CeremonyService} from '../../services/ceremony.service';
import {Ceremony} from '../../interfaces/Ceremony';
import { inPlaceSort } from 'fast-sort';
import _ from 'underscore';
import {CeremonyYear} from '../../interfaces/CeremonyYear';
import moment from 'moment';
import {ArrayUtil} from '../../utility/ArrayUtil';
import {Observable} from 'rxjs';
import {BsDatepickerConfig} from 'ngx-bootstrap/datepicker';
import {PersonService} from '../../services/person.service';
import {PersonGroup} from '../../interfaces/PersonGroup';
import {combineLatest} from 'rxjs';
import {GroupYear} from '../../interfaces/GroupYear';

@Component({
  selector: 'osc-admin-add-ceremony-popup',
  templateUrl: './admin-add-ceremony-popup.component.html',
  styleUrls: ['./admin-add-ceremony-popup.component.scss']
})
export class AdminAddCeremonyPopupComponent implements OnInit {

  ceremony_date: Date;
  selectedCeremony: Ceremony;
  year: number;

  groupButtons?: GroupButton[];

  validDate = false;

  bsConfig: Partial<BsDatepickerConfig> = {
    withTimepicker: true,
    showWeekNumbers: false,
    containerClass: 'theme-blue',
    dateInputFormat: 'M/D/YYYY, h:mm a',
  };

  constructor(public activeModal: BsModalRef,
              private ceremoniesService: CeremonyService,
              private personService: PersonService) { }

  ngOnInit(): void {
    this.initializeFields();
  }

  initializeFields(): void {
    combineLatest([this.ceremoniesService.ceremonies, this.personService.personGroups]).subscribe(([ceremonies, personGroups]) => {

      const mostRecentPerCeremony: CeremonyYear[] = [];
      for (const ceremony of ceremonies) {
        const ceremonyYears = ArrayUtil.cloneArray(ceremony.ceremonyYears);
        inPlaceSort(ceremonyYears).desc(cy => cy.ceremony_date);
        mostRecentPerCeremony.push(ceremonyYears[0]);
      }

      inPlaceSort(mostRecentPerCeremony).asc(cy => cy.ceremony_date);
      const lastCeremonyYearOfNextUp = mostRecentPerCeremony[0];
      this.selectedCeremony = _.findWhere(ceremonies, {id: lastCeremonyYearOfNextUp.ceremony_id});
      this.ceremony_date = moment(lastCeremonyYearOfNextUp.ceremony_date).add(1, 'year').toDate();
      this.year = lastCeremonyYearOfNextUp.year + 1;

      this.groupButtons = _.map(personGroups, personGroup => {
        const existing = _.findWhere(lastCeremonyYearOfNextUp.groupYears, {person_group_id: personGroup.id});
        return {personGroup, checked: !!existing};
      });

      this.validateModel();
    });

  }

  get ceremonies(): Observable<Ceremony[]> {
    return this.ceremoniesService.ceremonies;
  }

  selectCeremony(ceremony: Ceremony): void {
    this.selectedCeremony = ceremony;
    const ceremonyYears = ArrayUtil.cloneArray(ceremony.ceremonyYears);
    inPlaceSort(ceremonyYears).desc(cy => cy.ceremony_date);
    const lastCeremony = ceremonyYears[0];
    this.year = lastCeremony.year + 1;
    this.ceremony_date = moment(lastCeremony.ceremony_date).add(1, 'year').toDate();
  }

  yearChanged(event): void {
    const year = event.target.value;
    const yearChange = year - this.year;
    this.year = year;
    this.ceremony_date = moment(this.ceremony_date).add(yearChange, 'year').toDate();
  }

  disableAdd(): boolean {
    return !this.validDate;
  }

  isValidDate(): boolean {
    try {
      return this.ceremony_date instanceof Date && isFinite(this.ceremony_date.getTime());
    } catch (err) {
      return false;
    }
  }

  validateModel(): void {
    this.validDate = this.isValidDate();
  }

  async saveAndClose(): Promise<void> {
    const groupYears: Partial<GroupYear>[] = _.map(_.filter(this.groupButtons, {checked: true}), groupButton => {
      return {
        year: this.year,
        person_group_id: groupButton.personGroup.id,
      };
    });
    await this.ceremoniesService.addCeremonyYear(this.ceremony_date, this.selectedCeremony.id, this.year, groupYears);
    this.activeModal.hide();
  }

  dismiss(): void {
    this.activeModal.hide();
  }

}

interface GroupButton {
  personGroup: PersonGroup;
  checked: boolean;
}
