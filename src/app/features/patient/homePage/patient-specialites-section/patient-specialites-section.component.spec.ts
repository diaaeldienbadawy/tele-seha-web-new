import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientSpecialitesSectionComponent } from './patient-specialites-section.component';

describe('PatientSpecialitesSectionComponent', () => {
  let component: PatientSpecialitesSectionComponent;
  let fixture: ComponentFixture<PatientSpecialitesSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientSpecialitesSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientSpecialitesSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
