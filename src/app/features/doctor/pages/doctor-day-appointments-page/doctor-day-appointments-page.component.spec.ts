import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorDayAppointmentsPageComponent } from './doctor-day-appointments-page.component';

describe('DoctorDayAppointmentsPageComponent', () => {
  let component: DoctorDayAppointmentsPageComponent;
  let fixture: ComponentFixture<DoctorDayAppointmentsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorDayAppointmentsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorDayAppointmentsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
