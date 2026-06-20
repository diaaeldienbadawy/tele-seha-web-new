import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientPrivacyPolicyComponent } from './patient-privacy-policy.component';

describe('PatientPrivacyPolicyComponent', () => {
  let component: PatientPrivacyPolicyComponent;
  let fixture: ComponentFixture<PatientPrivacyPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientPrivacyPolicyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientPrivacyPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
