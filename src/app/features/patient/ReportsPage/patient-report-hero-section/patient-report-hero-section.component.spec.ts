import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientReportHeroSectionComponent } from './patient-report-hero-section.component';

describe('PatientReportHeroSectionComponent', () => {
  let component: PatientReportHeroSectionComponent;
  let fixture: ComponentFixture<PatientReportHeroSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientReportHeroSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientReportHeroSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
