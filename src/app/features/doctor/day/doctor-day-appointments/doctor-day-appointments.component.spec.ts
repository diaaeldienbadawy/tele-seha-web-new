import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorDayAppointmentsComponent } from './doctor-day-appointments.component';

describe('DoctorDayAppointmentsComponent', () => {
  let component: DoctorDayAppointmentsComponent;
  let fixture: ComponentFixture<DoctorDayAppointmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorDayAppointmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorDayAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
