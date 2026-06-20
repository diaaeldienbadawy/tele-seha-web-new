import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorTodaysAppointmentsSectionComponent } from './doctor-todays-appointments-section.component';

describe('DoctorTodaysAppointmentsSectionComponent', () => {
  let component: DoctorTodaysAppointmentsSectionComponent;
  let fixture: ComponentFixture<DoctorTodaysAppointmentsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorTodaysAppointmentsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorTodaysAppointmentsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
