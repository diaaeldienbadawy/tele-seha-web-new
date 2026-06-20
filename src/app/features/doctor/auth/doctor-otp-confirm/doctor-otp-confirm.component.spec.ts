import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorOtpConfirmComponent } from './doctor-otp-confirm.component';

describe('DoctorOtpConfirmComponent', () => {
  let component: DoctorOtpConfirmComponent;
  let fixture: ComponentFixture<DoctorOtpConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorOtpConfirmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorOtpConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
