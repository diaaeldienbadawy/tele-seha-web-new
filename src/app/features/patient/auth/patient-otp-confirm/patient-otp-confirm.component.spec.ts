import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientOtpConfirmComponent } from './patient-otp-confirm.component';

describe('PatientOtpConfirmComponent', () => {
  let component: PatientOtpConfirmComponent;
  let fixture: ComponentFixture<PatientOtpConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientOtpConfirmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientOtpConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
