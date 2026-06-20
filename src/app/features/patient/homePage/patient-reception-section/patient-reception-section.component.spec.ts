import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientReceptionSectionComponent } from './patient-reception-section.component';

describe('PatientReceptionSectionComponent', () => {
  let component: PatientReceptionSectionComponent;
  let fixture: ComponentFixture<PatientReceptionSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientReceptionSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientReceptionSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
