import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientPrivacyAndSecurityComponent } from './patient-privacy-and-security.component';

describe('PatientPrivacyAndSecurityComponent', () => {
  let component: PatientPrivacyAndSecurityComponent;
  let fixture: ComponentFixture<PatientPrivacyAndSecurityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientPrivacyAndSecurityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientPrivacyAndSecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
