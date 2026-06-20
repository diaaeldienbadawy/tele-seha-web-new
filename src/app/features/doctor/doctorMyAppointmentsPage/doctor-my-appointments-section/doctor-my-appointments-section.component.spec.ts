import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorMyAppointmentsSectionComponent } from './doctor-my-appointments-section.component';

describe('DoctorMyAppointmentsSectionComponent', () => {
  let component: DoctorMyAppointmentsSectionComponent;
  let fixture: ComponentFixture<DoctorMyAppointmentsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorMyAppointmentsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorMyAppointmentsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
