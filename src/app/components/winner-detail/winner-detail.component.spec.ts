import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WinnerDetailComponent } from './winner-detail.component';

describe('WinnerDetailComponent', () => {
  let component: WinnerDetailComponent;
  let fixture: ComponentFixture<WinnerDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WinnerDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WinnerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
