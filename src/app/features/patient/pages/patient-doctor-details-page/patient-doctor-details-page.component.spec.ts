import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDoctorDetailsPageComponent } from './patient-doctor-details-page.component';

describe('PatientDoctorDetailsPageComponent', () => {
  let component: PatientDoctorDetailsPageComponent;
  let fixture: ComponentFixture<PatientDoctorDetailsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientDoctorDetailsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientDoctorDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
