import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorDetailsOfMyAppointmentsComponent } from './doctor-details-of-my-appointments.component';

describe('DoctorDetailsOfMyAppointmentsComponent', () => {
  let component: DoctorDetailsOfMyAppointmentsComponent;
  let fixture: ComponentFixture<DoctorDetailsOfMyAppointmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorDetailsOfMyAppointmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorDetailsOfMyAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
