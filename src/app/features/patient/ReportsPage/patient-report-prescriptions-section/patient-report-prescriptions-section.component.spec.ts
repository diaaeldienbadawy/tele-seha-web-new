import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientReportPrescriptionsSectionComponent } from './patient-report-prescriptions-section.component';

describe('PatientReportPrescriptionsSectionComponent', () => {
  let component: PatientReportPrescriptionsSectionComponent;
  let fixture: ComponentFixture<PatientReportPrescriptionsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientReportPrescriptionsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientReportPrescriptionsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
