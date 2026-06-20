import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorWeeksAppointmentsPageComponent } from './doctor-weeks-appointments-page.component';

describe('DoctorWeeksAppointmentsPageComponent', () => {
  let component: DoctorWeeksAppointmentsPageComponent;
  let fixture: ComponentFixture<DoctorWeeksAppointmentsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorWeeksAppointmentsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorWeeksAppointmentsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
