import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientRecentAppointmentsSectionComponent } from './patient-recent-appointments-section.component';

describe('PatientRecentAppointmentsSectionComponent', () => {
  let component: PatientRecentAppointmentsSectionComponent;
  let fixture: ComponentFixture<PatientRecentAppointmentsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientRecentAppointmentsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientRecentAppointmentsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
