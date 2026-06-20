import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientWaitingInfoSectionComponent } from './patient-waiting-info-section.component';

describe('PatientWaitingInfoSectionComponent', () => {
  let component: PatientWaitingInfoSectionComponent;
  let fixture: ComponentFixture<PatientWaitingInfoSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientWaitingInfoSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientWaitingInfoSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
