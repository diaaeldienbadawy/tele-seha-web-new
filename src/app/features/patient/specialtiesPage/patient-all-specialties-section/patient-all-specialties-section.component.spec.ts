import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAllSpecialtiesSectionComponent } from './patient-all-specialties-section.component';

describe('PatientAllSpecialtiesSectionComponent', () => {
  let component: PatientAllSpecialtiesSectionComponent;
  let fixture: ComponentFixture<PatientAllSpecialtiesSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientAllSpecialtiesSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientAllSpecialtiesSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
