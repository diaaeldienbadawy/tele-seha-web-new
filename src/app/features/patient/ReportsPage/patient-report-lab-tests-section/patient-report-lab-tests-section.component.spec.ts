import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientReportLabTestsSectionComponent } from './patient-report-lab-tests-section.component';

describe('PatientReportLabTestsSectionComponent', () => {
  let component: PatientReportLabTestsSectionComponent;
  let fixture: ComponentFixture<PatientReportLabTestsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientReportLabTestsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientReportLabTestsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
