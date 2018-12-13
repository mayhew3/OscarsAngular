import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NomineesComponent } from './nominees.component';

describe('NomineesComponent', () => {
  let component: NomineesComponent;
  let fixture: ComponentFixture<NomineesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NomineesComponent ]
    })
    .compileComponents();
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
