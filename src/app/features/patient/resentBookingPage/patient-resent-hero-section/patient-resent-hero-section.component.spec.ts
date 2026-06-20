import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientResentHeroSectionComponent } from './patient-resent-hero-section.component';

describe('PatientResentHeroSectionComponent', () => {
  let component: PatientResentHeroSectionComponent;
  let fixture: ComponentFixture<PatientResentHeroSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientResentHeroSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientResentHeroSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
