import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorPoliciesAndProceduresComponent } from './doctor-policies-and-procedures.component';

describe('DoctorPoliciesAndProceduresComponent', () => {
  let component: DoctorPoliciesAndProceduresComponent;
  let fixture: ComponentFixture<DoctorPoliciesAndProceduresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorPoliciesAndProceduresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorPoliciesAndProceduresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
