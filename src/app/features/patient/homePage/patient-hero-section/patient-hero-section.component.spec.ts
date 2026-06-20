import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientHeroSectionComponent } from './patient-hero-section.component';

describe('PatientHeroSectionComponent', () => {
  let component: PatientHeroSectionComponent;
  let fixture: ComponentFixture<PatientHeroSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientHeroSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientHeroSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
