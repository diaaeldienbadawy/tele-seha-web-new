import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientSpecialtiesPageComponent } from './patient-specialties-page.component';

describe('PatientSpecialtiesPageComponent', () => {
  let component: PatientSpecialtiesPageComponent;
  let fixture: ComponentFixture<PatientSpecialtiesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientSpecialtiesPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientSpecialtiesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
