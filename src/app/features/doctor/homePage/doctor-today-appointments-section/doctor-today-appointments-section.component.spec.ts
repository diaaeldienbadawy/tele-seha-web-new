import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorTodayAppointmentsSectionComponent } from './doctor-today-appointments-section.component';

describe('DoctorTodayAppointmentsSectionComponent', () => {
  let component: DoctorTodayAppointmentsSectionComponent;
  let fixture: ComponentFixture<DoctorTodayAppointmentsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorTodayAppointmentsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorTodayAppointmentsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
