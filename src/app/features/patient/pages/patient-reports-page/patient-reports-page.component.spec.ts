import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientReportsPageComponent } from './patient-reports-page.component';

describe('PatientReportsPageComponent', () => {
  let component: PatientReportsPageComponent;
  let fixture: ComponentFixture<PatientReportsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientReportsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientReportsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
