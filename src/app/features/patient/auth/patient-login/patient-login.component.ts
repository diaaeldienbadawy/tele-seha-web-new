import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { AuthLeftSideComponent } from '../../../../shared/components/auth-left-side/auth-left-side.component';
import { AuthLogoComponent } from '../../../../shared/components/auth-logo/auth-logo.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { INextStep, INextStepEnum } from '../../../../core/models/nextStepEnum';
import { GlobalUserStateService } from '../../../../core/services/state/global-user-state.service';
import { AuthProcessStateService } from '../../../../core/services/state/auth-process-state.service';
import { PatientAuthService } from '../../service/patient-auth.service';
import { ToastrService } from 'ngx-toastr';
import intlTelInput from 'intl-tel-input';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-patient-login',
  imports: [
    AuthLeftSideComponent,
    AuthLogoComponent,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
  ],
  templateUrl: './patient-login.component.html',
  styleUrl: './patient-login.component.css',
})
export class PatientLoginComponent implements AfterViewInit {
  @ViewChild('phoneInput') phoneInput!: ElementRef;
  iti: any;

  ngAfterViewInit() {
    this.iti = intlTelInput(this.phoneInput.nativeElement, {
      initialCountry: 'eg',
      preferredCountries: ['eg', 'sa', 'ae'],
      separateDialCode: true,
      utilsScript:
        'https://cdn.jsdelivr.net/npm/intl-tel-input@18/build/js/utils.js',
      // أو لو عندك locally:
      // utilsScript: 'node_modules/intl-tel-input/build/js/utils.js'
    });

    // تأخير بسيط عشان الـ DOM يكون جاهز
    // setTimeout(() => {
    //   const saved = localStorage.getItem('phone');
    //   if (saved) {
    //     this.iti.setNumber(saved);
    //   }
    //   this.updatePhone(); // sync initial value
    // }, 100);

    const el = this.phoneInput.nativeElement;
    const sanitizeInput = () => {
      let val = el.value.replace(/[^0-9]/g, '');
      if (val.length > 11) {
        val = val.slice(0, 11);
      }
      el.value = val;
      this.updatePhone();
    };
    el.addEventListener('input', sanitizeInput);
    el.addEventListener('change', sanitizeInput);
    el.addEventListener('countrychange', () => this.updatePhone());
  }

  private updatePhone() {
    const dialCode = '+' + this.iti.getSelectedCountryData().dialCode; // +20
    const rawInput = this.phoneInput.nativeElement.value.trim(); // اللي المستخدم كتبه فعلاً

    if (!rawInput) {
      this.mobileForm.patchValue({ mobile: null });
      return;
    }

    const formatted = `${dialCode}-${rawInput}`; // +20-01012345678
    this.mobileForm.patchValue({ mobile: formatted });
  }
  isLoading: boolean = false;

  constructor(
    readonly patientAuthService: PatientAuthService,
    readonly fb: FormBuilder,
    readonly route: Router,
    readonly toaster: ToastrService,
    readonly globalUserStateService: GlobalUserStateService,
    readonly authProcessStateService: AuthProcessStateService,
  ) {}

  mobileForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.mobileForm = this.fb.group({
      mobile: [null, [Validators.required]],
    });
  }

  submit() {
    const dialCode = '+' + this.iti.getSelectedCountryData().dialCode;
    const rawInput = this.phoneInput.nativeElement.value.trim();
    const formatted = `${dialCode}-${rawInput}`; // +20-01012345678

    if (!rawInput) {
      this.toaster.error('Phone is required');
      return;
    }

    this.isLoading = true;
    this.patientAuthService.loginMobile(formatted).subscribe({
      next: (res: INextStep) => {
        this.isLoading = false;
        this.globalUserStateService.hydrateNextStep(res.nextStep);
        this.authProcessStateService.setMobile(formatted);

        switch (res.nextStep) {
          case INextStepEnum.OtpConfirm:
            this.toaster.success('OTP Sent Successfully');
            this.route.navigate(['patient/auth/verify-otp'], { replaceUrl: true });
            break;
          case INextStepEnum.Login:
            this.route.navigate(['patient/auth/password'], { replaceUrl: true });
            break;
          case INextStepEnum.CreatePassword:
            const token = this.getCookie('createPasswordToken');
            if (!token) {
              this.isLoading = true;
              this.patientAuthService.resendOtp(formatted).subscribe({
                next: (resendRes: INextStep) => {
                  this.isLoading = false;
                  this.globalUserStateService.hydrateNextStep(resendRes.nextStep);
                  this.toaster.success('OTP Resent Successfully');
                  this.route.navigate(['patient/auth/verify-otp'], { replaceUrl: true });
                },
                error: () => {
                  this.isLoading = false;
                }
              });
            } else {
              this.route.navigate(['patient/auth/password'], { replaceUrl: true });
            }
            break;
          case INextStepEnum.CreateProfile:
            this.route.navigate(['patient/auth/register/basic-info'], { replaceUrl: true });
            break;
          case INextStepEnum.CreateMedicalProfile:
            this.route.navigate(['patient/auth/register/medical-history'], { replaceUrl: true });
            break;
          case INextStepEnum.OpenHome:
            this.toaster.success('Login Successfully');
            this.route.navigate(['patient/home'], { replaceUrl: true });
            break;
          default:
            this.globalUserStateService.hydrateNextStep(res.nextStep);
            break;
        }
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split(';');
    for (let c of cookies) {
      const [key, val] = c.trim().split('=');
      if (key === name) return val;
    }
    return null;
  }

  clearLocalStorage() {
    this.globalUserStateService.clearUserData();
    this.authProcessStateService.clearAuthData();
    this.route.navigate(['/'], { replaceUrl: true });
  }
}
