import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonConnectionSnackBarComponent } from './person-connection-snack-bar.component';

describe('PersonConnectionSnackBarComponent', () => {
  let component: PersonConnectionSnackBarComponent;
  let fixture: ComponentFixture<PersonConnectionSnackBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersonConnectionSnackBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonConnectionSnackBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
