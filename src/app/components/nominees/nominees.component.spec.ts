import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NomineesComponent } from './nominees.component';
import {RouterTestingModule} from '@angular/router/testing';
import {routes} from '../../app-routing.module';
import {FormsModule} from '@angular/forms';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {HttpClientInMemoryWebApiModule} from 'angular-in-memory-web-api';
import {InMemoryDataService} from '../../services/in-memory-data-service';
import {CategoriesComponent} from '../categories/categories.component';
import {CategoryHopperComponent} from '../category-hopper/category-hopper.component';
import {ActivatedRoute} from '@angular/router';
import {ActivatedRouteStub} from '../../../testing/activated-route-stub';

describe('NomineesComponent', () => {
  let component: NomineesComponent;
  let fixture: ComponentFixture<NomineesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        FormsModule,
        HttpClientTestingModule,
        HttpClientInMemoryWebApiModule.forRoot(
          InMemoryDataService, { dataEncapsulation: false, delay: 0 }
        )],
      declarations: [
        CategoriesComponent,
        NomineesComponent,
        CategoryHopperComponent ],
      providers: [
        {provide: ActivatedRoute, useValue: new ActivatedRouteStub({category_id: 2})}
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NomineesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
