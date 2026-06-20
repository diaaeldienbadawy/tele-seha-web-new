import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientReportContentSectionComponent } from './patient-report-content-section.component';

describe('PatientReportContentSectionComponent', () => {
  let component: PatientReportContentSectionComponent;
  let fixture: ComponentFixture<PatientReportContentSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientReportContentSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientReportContentSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
