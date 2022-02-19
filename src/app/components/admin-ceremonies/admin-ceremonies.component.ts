import { Component, OnInit } from '@angular/core';
import {CeremonyService} from '../../services/ceremony.service';

@Component({
  selector: 'osc-admin-ceremonies',
  templateUrl: './admin-ceremonies.component.html',
  styleUrls: ['./admin-ceremonies.component.scss']
})
export class AdminCeremoniesComponent implements OnInit {

  constructor(public ceremonyService: CeremonyService) { }

  ngOnInit(): void {
  }

}
