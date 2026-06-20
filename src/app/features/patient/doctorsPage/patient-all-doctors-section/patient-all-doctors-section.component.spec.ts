import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAllDoctorsSectionComponent } from './patient-all-doctors-section.component';

describe('PatientAllDoctorsSectionComponent', () => {
  let component: PatientAllDoctorsSectionComponent;
  let fixture: ComponentFixture<PatientAllDoctorsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientAllDoctorsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientAllDoctorsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
