import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorNonRecurringAppointmentsComponent } from './doctor-non-recurring-appointments.component';

describe('DoctorNonRecurringAppointmentsComponent', () => {
  let component: DoctorNonRecurringAppointmentsComponent;
  let fixture: ComponentFixture<DoctorNonRecurringAppointmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorNonRecurringAppointmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorNonRecurringAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
