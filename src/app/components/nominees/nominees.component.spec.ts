import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NomineesComponent } from './nominees.component';
import {RouterTestingModule} from '@angular/router/testing';
import {routes} from '../../app-routing.module';
import {FormsModule} from '@angular/forms';
import {CategoriesComponent} from '../categories/categories.component';
import {CategoryHopperComponent} from '../category-hopper/category-hopper.component';
import {ActivatedRoute} from '@angular/router';
import {ActivatedRouteStub} from '../../../testing/activated-route-stub';
import {CategoryService} from '../../services/category.service';
import {CategoryServiceStub} from '../../services/category.service.stub';
import {CallbackComponent} from '../callback/callback.component';

describe('NomineesComponent', () => {
  let component: NomineesComponent;
  let fixture: ComponentFixture<NomineesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        FormsModule],
      declarations: [
        CategoriesComponent,
        NomineesComponent,
        CategoryHopperComponent,
        CallbackComponent],
      providers: [
        {provide: ActivatedRoute, useValue: new ActivatedRouteStub({category_id: 2})},
        {provide: CategoryService, useClass: CategoryServiceStub}
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
