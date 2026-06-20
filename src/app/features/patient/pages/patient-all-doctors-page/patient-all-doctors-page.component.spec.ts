import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAllDoctorsPageComponent } from './patient-all-doctors-page.component';

describe('PatientAllDoctorsPageComponent', () => {
  let component: PatientAllDoctorsPageComponent;
  let fixture: ComponentFixture<PatientAllDoctorsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientAllDoctorsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientAllDoctorsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
