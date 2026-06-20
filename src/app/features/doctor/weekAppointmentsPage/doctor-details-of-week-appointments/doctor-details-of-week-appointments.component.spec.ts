import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorDetailsOfWeekAppointmentsComponent } from './doctor-details-of-week-appointments.component';

describe('DoctorDetailsOfWeekAppointmentsComponent', () => {
  let component: DoctorDetailsOfWeekAppointmentsComponent;
  let fixture: ComponentFixture<DoctorDetailsOfWeekAppointmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorDetailsOfWeekAppointmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorDetailsOfWeekAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
