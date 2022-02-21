import { Component, OnInit } from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap/modal';
import {CeremonyService} from '../../services/ceremony.service';
import {Ceremony} from '../../interfaces/Ceremony';
import fast_sort from 'fast-sort';
import _ from 'underscore';
import {CeremonyYear} from '../../interfaces/CeremonyYear';
import moment from 'moment';
import {ArrayUtil} from '../../utility/ArrayUtil';
import {Observable} from 'rxjs';
import {BsDatepickerConfig} from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'osc-admin-add-ceremony-popup',
  templateUrl: './admin-add-ceremony-popup.component.html',
  styleUrls: ['./admin-add-ceremony-popup.component.scss']
})
export class AdminAddCeremonyPopupComponent implements OnInit {

  ceremony_date: Date;
  selectedCeremony: Ceremony;
  year: number;

  validDate = false;

  bsConfig: Partial<BsDatepickerConfig> = {
    withTimepicker: true,
    showWeekNumbers: false,
    containerClass: 'theme-blue',
    dateInputFormat: 'M/D/YYYY, h:mm a',
  };

  constructor(public activeModal: BsModalRef,
              private ceremoniesService: CeremonyService) { }

  ngOnInit(): void {
    this.initializeFields();
  }

  initializeFields(): void {
    this.ceremoniesService.ceremonies.subscribe(ceremonies => {
      const mostRecentPerCeremony: CeremonyYear[] = [];
      for (const ceremony of ceremonies) {
        const ceremonyYears = ArrayUtil.cloneArray(ceremony.ceremonyYears);
        fast_sort(ceremonyYears).desc(cy => cy.ceremony_date);
        mostRecentPerCeremony.push(ceremonyYears[0]);
      }
      fast_sort(mostRecentPerCeremony).asc(cy => cy.ceremony_date);
      const lastCeremonyYearOfNextUp = mostRecentPerCeremony[0];
      this.selectedCeremony = _.findWhere(ceremonies, {id: lastCeremonyYearOfNextUp.ceremony_id});
      this.ceremony_date = moment(lastCeremonyYearOfNextUp.ceremony_date).add(1, 'year').toDate();
      this.year = lastCeremonyYearOfNextUp.year + 1;
      this.validateModel();
    });
  }

  get ceremonies(): Observable<Ceremony[]> {
    return this.ceremoniesService.ceremonies;
  }

  selectCeremony(ceremony: Ceremony): void {
    this.selectedCeremony = ceremony;
    const ceremonyYears = ArrayUtil.cloneArray(ceremony.ceremonyYears);
    fast_sort(ceremonyYears).desc(cy => cy.ceremony_date);
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
    await this.ceremoniesService.addCeremonyYear(this.ceremony_date, this.selectedCeremony.id, this.year);
    this.activeModal.hide();
  }

  dismiss(): void {
    this.activeModal.hide();
  }

}
