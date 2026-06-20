import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientPoliciesAndProceduresComponent } from './patient-policies-and-procedures.component';

describe('PatientPoliciesAndProceduresComponent', () => {
  let component: PatientPoliciesAndProceduresComponent;
  let fixture: ComponentFixture<PatientPoliciesAndProceduresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientPoliciesAndProceduresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientPoliciesAndProceduresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
