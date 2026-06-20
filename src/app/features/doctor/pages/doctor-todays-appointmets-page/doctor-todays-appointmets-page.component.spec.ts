import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorTodaysAppointmetsPageComponent } from './doctor-todays-appointmets-page.component';

describe('DoctorTodaysAppointmetsPageComponent', () => {
  let component: DoctorTodaysAppointmetsPageComponent;
  let fixture: ComponentFixture<DoctorTodaysAppointmetsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorTodaysAppointmetsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorTodaysAppointmetsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
