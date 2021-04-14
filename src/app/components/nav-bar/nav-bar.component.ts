import {Component, OnInit} from '@angular/core';
import {MyAuthService} from '../../services/auth/my-auth.service';
import {SystemVarsService} from '../../services/system.vars.service';

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

}
