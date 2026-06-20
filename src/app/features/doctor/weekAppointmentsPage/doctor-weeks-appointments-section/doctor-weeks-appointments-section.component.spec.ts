import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorWeeksAppointmentsSectionComponent } from './doctor-weeks-appointments-section.component';

describe('DoctorWeeksAppointmentsSectionComponent', () => {
  let component: DoctorWeeksAppointmentsSectionComponent;
  let fixture: ComponentFixture<DoctorWeeksAppointmentsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorWeeksAppointmentsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorWeeksAppointmentsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
