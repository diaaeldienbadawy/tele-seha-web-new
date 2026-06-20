import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientTermAndConditionsComponent } from './patient-term-and-conditions.component';

describe('PatientTermAndConditionsComponent', () => {
  let component: PatientTermAndConditionsComponent;
  let fixture: ComponentFixture<PatientTermAndConditionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientTermAndConditionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientTermAndConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
