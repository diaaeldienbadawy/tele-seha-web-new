import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDoctorHeroSectionComponent } from './patient-doctor-hero-section.component';

describe('PatientDoctorHeroSectionComponent', () => {
  let component: PatientDoctorHeroSectionComponent;
  let fixture: ComponentFixture<PatientDoctorHeroSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientDoctorHeroSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientDoctorHeroSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
