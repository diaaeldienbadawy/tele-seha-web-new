import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAllResentSectionComponent } from './patient-all-resent-section.component';

describe('PatientAllResentSectionComponent', () => {
  let component: PatientAllResentSectionComponent;
  let fixture: ComponentFixture<PatientAllResentSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientAllResentSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientAllResentSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
