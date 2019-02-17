import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OddsMainComponent } from './odds-main.component';
import {CategoriesComponent} from '../categories/categories.component';
import {RouterTestingModule} from '@angular/router/testing';
import {routes} from '../../app-routing.module';
import {FormsModule} from '@angular/forms';
import {NomineesComponent} from '../nominees/nominees.component';
import {CategoryHopperComponent} from '../category-hopper/category-hopper.component';
import {HomeComponent} from '../home/home.component';
import {VoteMainComponent} from '../vote-main/vote-main.component';
import {VoteDetailComponent} from '../vote-detail/vote-detail.component';
import {OddsDetailComponent} from '../odds-detail/odds-detail.component';
import {CallbackComponent} from '../callback/callback.component';
import {CategoryService} from '../../services/category.service';
import {CategoryServiceStub} from '../../services/category.service.stub';

describe('OddsMainComponent', () => {
  let component: OddsMainComponent;
  let fixture: ComponentFixture<OddsMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        FormsModule],
      declarations: [
        CategoriesComponent,
        NomineesComponent,
        CategoryHopperComponent,
        HomeComponent,
        VoteMainComponent,
        OddsMainComponent,
        VoteDetailComponent,
        OddsDetailComponent,
        CallbackComponent],
      providers: [
        {provide: CategoryService, useClass: CategoryServiceStub}
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OddsMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});