import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CategoryHopperComponent} from './category-hopper.component';
import {FormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {routes} from '../../app-routing.module';
import {CategoriesComponent} from '../categories/categories.component';
import {NomineesComponent} from '../nominees/nominees.component';
import {CategoryService} from '../../services/category.service';
import {CategoryServiceStub} from '../../services/category.service.stub';
import {TestCategoryList} from '../../services/categories.test.mock';
import {Category} from '../../interfaces/Category';
import {_} from 'underscore';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';

describe('CategoryHopperComponent', () => {
  let component: CategoryHopperComponent;
  let fixture: ComponentFixture<CategoryHopperComponent>;
  let element: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        FormsModule],
      declarations: [
        CategoriesComponent,
        NomineesComponent,
        CategoryHopperComponent ],
      providers: [
        {provide: CategoryService, useClass: CategoryServiceStub}
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryHopperComponent);
    component = fixture.componentInstance;
    element = fixture.debugElement;
  });

  function populateInputs(categoryIndex: number) {
    const currentCategory = getCategory(categoryIndex);
    component.nominees = currentCategory ? currentCategory.nominees : [];

    component.next = getCategory(categoryIndex + 1);
    component.prev = getCategory(categoryIndex - 1);

    fixture.detectChanges();
  }

  function getCategory(categoryIndex): Category {
    return categoryIndex >= TestCategoryList.length ? null : TestCategoryList[categoryIndex];
  }

  function findButtonWithText(subElement: DebugElement, textToFind: String): DebugElement {
    const debugElements = subElement.queryAll(By.css('button'));
    return _.find(debugElements, (button) => {
      return button.nativeElement.innerHTML.includes(textToFind);
    });
  }



  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('nominees not populated if no input given', () => {
    expect(component.nominees).toBeFalsy();
    expect(component.next).toBeFalsy();
    expect(component.prev).toBeFalsy();
  });

  it('inputs populated if all exist', () => {
    populateInputs(1);
    expect(component.nominees.length).toBe(3);
    expect(component.next).toBeTruthy();
    expect(component.prev).toBeTruthy();
  });

  it('next empty if last', () => {
    populateInputs(2);
    expect(component.nominees.length).toBe(3);
    expect(component.next).toBeFalsy();
    expect(component.prev).toBeTruthy();
  });

  it('prev empty if first', () => {
    populateInputs(0);
    expect(component.nominees.length).toBe(3);
    expect(component.next).toBeTruthy();
    expect(component.prev).toBeFalsy();
  });

  it('all buttons exist for all inputs', () => {
    populateInputs(1);
    expect(findButtonWithText(element, 'Prev')).toBeTruthy();
    expect(findButtonWithText(element, 'Next')).toBeTruthy();
    expect(findButtonWithText(element, 'Up')).toBeTruthy();
  });

  it('next button disabled if no input', () => {
    populateInputs(2);
    expect(findButtonWithText(element, 'Prev')).toBeTruthy();
    expect(findButtonWithText(element, 'Next')).toBeFalsy();
    expect(findButtonWithText(element, 'Up')).toBeTruthy();
  });

  it('prev button disabled if no input', () => {
    populateInputs(0);
    expect(findButtonWithText(element, 'Prev')).toBeFalsy();
    expect(findButtonWithText(element, 'Next')).toBeTruthy();
    expect(findButtonWithText(element, 'Up')).toBeTruthy();
  });

  it('totalOdds expert', () => {
    populateInputs(1);
    expect(component.totalOdds('expert')).toBe(98);
  });

  it('totalOdds user', () => {
    populateInputs(1);
    expect(component.totalOdds('user')).toBe(81);
  });

  it('totalOddsVegas', () => {
    populateInputs(1);
    expect(component.totalOddsVegas()).toBe(97.06959706959707);
  });

  it('totalOdds unrecognized', () => {
    populateInputs(1);
    expect(component.totalOdds('unrecognized')).toBe(0);
  });

  it('hasChanges is false after inputs', () => {
    populateInputs(1);
    expect(component.hasChanges()).toBe(false);
  });

  it('submit button disabled on init', () => {
    populateInputs(1);
    expect(findButtonWithText(element,'Submit').nativeElement.disabled)
      .toBeTruthy('submit button is enabled');
  });

  it('hasChanges is true after one change', () => {
    populateInputs(1);
    component.nominees[0].odds_expert = 23;
    expect(component.hasChanges()).toBe(true);
  });
});
