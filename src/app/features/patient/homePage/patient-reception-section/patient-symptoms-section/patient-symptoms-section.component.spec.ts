import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientSymptomsSectionComponent } from './patient-symptoms-section.component';

describe('PatientSymptomsSectionComponent', () => {
  let component: PatientSymptomsSectionComponent;
  let fixture: ComponentFixture<PatientSymptomsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientSymptomsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientSymptomsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
