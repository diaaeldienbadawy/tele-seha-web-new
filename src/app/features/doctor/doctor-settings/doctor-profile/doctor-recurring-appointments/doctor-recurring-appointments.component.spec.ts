import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorRecurringAppointmentsComponent } from './doctor-recurring-appointments.component';

describe('DoctorRecurringAppointmentsComponent', () => {
  let component: DoctorRecurringAppointmentsComponent;
  let fixture: ComponentFixture<DoctorRecurringAppointmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorRecurringAppointmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorRecurringAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
