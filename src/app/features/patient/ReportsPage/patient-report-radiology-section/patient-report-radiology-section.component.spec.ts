import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientReportRadiologySectionComponent } from './patient-report-radiology-section.component';

describe('PatientReportRadiologySectionComponent', () => {
  let component: PatientReportRadiologySectionComponent;
  let fixture: ComponentFixture<PatientReportRadiologySectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientReportRadiologySectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientReportRadiologySectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
