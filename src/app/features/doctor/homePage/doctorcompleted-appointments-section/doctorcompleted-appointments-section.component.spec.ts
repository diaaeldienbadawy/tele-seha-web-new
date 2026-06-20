import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorcompletedAppointmentsSectionComponent } from './doctorcompleted-appointments-section.component';

describe('DoctorcompletedAppointmentsSectionComponent', () => {
  let component: DoctorcompletedAppointmentsSectionComponent;
  let fixture: ComponentFixture<DoctorcompletedAppointmentsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorcompletedAppointmentsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorcompletedAppointmentsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
