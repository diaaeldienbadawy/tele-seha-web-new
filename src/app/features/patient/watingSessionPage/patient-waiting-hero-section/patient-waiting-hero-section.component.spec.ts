import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientWaitingHeroSectionComponent } from './patient-waiting-hero-section.component';

describe('PatientWaitingHeroSectionComponent', () => {
  let component: PatientWaitingHeroSectionComponent;
  let fixture: ComponentFixture<PatientWaitingHeroSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientWaitingHeroSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientWaitingHeroSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
