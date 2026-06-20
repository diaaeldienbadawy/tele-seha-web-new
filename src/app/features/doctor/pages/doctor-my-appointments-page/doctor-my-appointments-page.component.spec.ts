import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorMyAppointmentsPageComponent } from './doctor-my-appointments-page.component';

describe('DoctorMyAppointmentsPageComponent', () => {
  let component: DoctorMyAppointmentsPageComponent;
  let fixture: ComponentFixture<DoctorMyAppointmentsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorMyAppointmentsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorMyAppointmentsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
