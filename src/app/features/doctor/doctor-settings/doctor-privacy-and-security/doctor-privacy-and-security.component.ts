import { CommonModule } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  FormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { PatientAuthService } from '../../../patient/service/patient-auth.service';
import { DoctorsService } from '../../../../shared/services/doctors.service';
import { PatientService } from '../../../../shared/services/patient.service';

@Component({
  selector: 'app-doctor-privacy-and-security',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './doctor-privacy-and-security.component.html',
  styleUrl: './doctor-privacy-and-security.component.css',
})
export class DoctorPrivacyAndSecurityComponent {
  showOtpForm: boolean = false;

  otpForm!: FormGroup;
  mobileForm!: FormGroup;
  otpArray: string[] = ['', '', '', '', '', ''];
  showError: boolean = false;
  mobile: string = '+20-1234567898';

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  doctorId!: number;
  constructor(
    readonly fb: FormBuilder,
    readonly route: Router,
    readonly localStorageService: LocalstorageService,
    readonly doctorService: DoctorsService,
    readonly patientService: PatientService,
    readonly toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.doctorId = Number(this.localStorageService.get('doctorId')) || 0;
    console.log('doctorId:', this.doctorId);

    this.mobileForm = this.fb.group({
      mobile: [{ value: '', disabled: true }],
    });

    this.loadPatientDetails();
    this.otpForm = this.fb.group({
      otp: [''],
      mobile: [''],
    });
  }

  dataProfile: any;

  loadPatientDetails() {
    this.doctorService.getDoctorProfile(this.doctorId).subscribe({
      next: (res) => {
        console.log(res);
        this.dataProfile = res.patient?.data;
        this.mobileForm.patchValue({
          mobile: this.dataProfile.mobile,
        });
      },
      error: () => {
        this.toastr.error('Failed to load info lists');
      },
    });
  }

  showDisableBtn: boolean = true;

  toggleMobileEdit() {
    if (this.showDisableBtn) {
      // Edit
      this.mobileForm.get('mobile')?.enable();
    } else {
      // Save
      this.mobileForm.get('mobile')?.disable();
      console.log(this.mobileForm.value);

      this.patientService
        .changeMobileNumber({ mobile: this.mobileForm.get('mobile')?.value })
        .subscribe({
          next: (res) => {
            console.log(res);
            this.toastr.success(
              'Mobile number updated successfully , please verify new number',
            );
            this.showOtpForm = true;
          },
          error: () => {
            this.toastr.error('Failed to update mobile number');
          },
        });
    }

    this.showDisableBtn = !this.showDisableBtn;
  }

  closeMobileEdit() {
    this.showDisableBtn = true;
    this.mobileForm.get('mobile')?.disable();
  }

  controls = new Array(6);

  onInput(event: any, index: number) {
    const value = event.target.value;

    if (!/^[0-9]$/.test(value)) {
      event.target.value = '';
      return;
    }

    this.otpArray[index] = value;
    this.showError = false;

    if (index < 5) {
      const inputs = this.otpInputs.toArray();
      inputs[index + 1].nativeElement.focus();
    }
  }

  //  Backspace
  onKeyDown(event: KeyboardEvent, index: number) {
    const inputs = this.otpInputs.toArray();
    if (event.key !== 'Backspace') return;

    event.preventDefault();

    const curr = inputs[index].nativeElement as HTMLInputElement;

    if (curr.value) {
      curr.value = '';
      this.otpArray[index] = '';
      if (index > 0) {
        const prev = inputs[index - 1].nativeElement as HTMLInputElement;
        prev.focus();
      }
    } else {
      if (index > 0) {
        const prev = inputs[index - 1].nativeElement as HTMLInputElement;
        prev.value = '';
        this.otpArray[index - 1] = '';
        prev.focus();
      }
    }
  }

  submitOtp() {
    const code = this.otpArray.join('');

    if (code.length < 6) {
      this.showError = true;
      return;
    }

    this.otpForm.patchValue({ otp: code });
    console.log('Final OTP:', code);
    console.log('Mobile:', this.mobile);

    const payload = { mobile: this.mobile, otp: code };

    this.patientService.verifyOtp(payload).subscribe({
      next: (res) => {
        console.log(res);
        this.toastr.success('Mobile number verified successfully');
        this.loadPatientDetails();
      },
      error: () => {
        this.toastr.error('Failed to verify mobile number');
      },
    });

    this.showOtpForm = false;
  }
}
