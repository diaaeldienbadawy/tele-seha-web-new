import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorWeeklyAppointmentsSectionComponent } from './doctor-weekly-appointments-section.component';

describe('DoctorWeeklyAppointmentsSectionComponent', () => {
  let component: DoctorWeeklyAppointmentsSectionComponent;
  let fixture: ComponentFixture<DoctorWeeklyAppointmentsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorWeeklyAppointmentsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorWeeklyAppointmentsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
