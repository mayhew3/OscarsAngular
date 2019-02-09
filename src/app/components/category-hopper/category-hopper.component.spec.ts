import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryHopperComponent } from './category-hopper.component';
import {FormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {routes} from '../../app-routing.module';
import {CategoriesComponent} from '../categories/categories.component';
import {NomineesComponent} from '../nominees/nominees.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {HttpClientInMemoryWebApiModule} from 'angular-in-memory-web-api';
import {InMemoryDataService} from '../../services/in-memory-data-service';

describe('CategoryHopperComponent', () => {
  let component: CategoryHopperComponent;
  let fixture: ComponentFixture<CategoryHopperComponent>;

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
        CategoryHopperComponent ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryHopperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
