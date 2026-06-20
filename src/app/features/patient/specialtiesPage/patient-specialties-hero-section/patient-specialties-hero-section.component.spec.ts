import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientSpecialtiesHeroSectionComponent } from './patient-specialties-hero-section.component';

describe('PatientSpecialtiesHeroSectionComponent', () => {
  let component: PatientSpecialtiesHeroSectionComponent;
  let fixture: ComponentFixture<PatientSpecialtiesHeroSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientSpecialtiesHeroSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientSpecialtiesHeroSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
