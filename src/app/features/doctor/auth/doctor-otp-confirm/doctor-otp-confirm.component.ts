import { Component, OnInit } from '@angular/core';
import { ElementRef, QueryList, ViewChildren } from '@angular/core';
import { AuthLogoComponent } from '../../../../shared/components/auth-logo/auth-logo.component';
import { AuthLeftSideComponent } from '../../../../shared/components/auth-left-side/auth-left-side.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { GlobalUserStateService } from '../../../../core/services/state/global-user-state.service';
import { AuthProcessStateService } from '../../../../core/services/state/auth-process-state.service';
import { INextStepEnum } from '../../../../core/models/nextStepEnum';
import { ToastrService } from 'ngx-toastr';
import { DoctorAuthService } from '../../service/doctor-auth.service';

@Component({
  selector: 'app-doctor-otp-confirm',
  imports: [
    CommonModule,
    AuthLogoComponent,
    AuthLeftSideComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './doctor-otp-confirm.component.html',
  styleUrl: './doctor-otp-confirm.component.css',
})
export class DoctorOtpConfirmComponent implements OnInit {
  otpForm!: FormGroup;
  otpArray: string[] = ['', '', '', '', '', ''];
  showError: boolean = false;
  mobile: string = '';
  isLoading: boolean = false;

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  constructor(
    readonly fb: FormBuilder,
    readonly route: Router,
    readonly globalUserStateService: GlobalUserStateService,
    readonly authProcessStateService: AuthProcessStateService,
    readonly doctorAuthService: DoctorAuthService,
    readonly toastr: ToastrService,
  ) {
    this.mobile = this.authProcessStateService.mobile();
  }

  ngOnInit(): void {
    this.otpForm = this.fb.group({
      otp: [''],
    });
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

    const payload = { mobile: this.mobile, otp: code };

    this.isLoading = true;

    this.doctorAuthService.otpConfirm(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.toastr.success('OTP Confirmed Successfully');
        this.setCookie('createPasswordToken', res.data, 1);
        this.authProcessStateService.setCreatePasswordToken(res.data);
        if (res.nextStep === INextStepEnum.CreatePassword) {
          this.globalUserStateService.hydrateNextStep(res.nextStep);
          this.route.navigate(['doctor/auth/password'], { replaceUrl: true });
        }
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  setCookie(name: string, value: string, days = 1) {
    if (typeof document === 'undefined') return;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
  }

  clearLocalStorage() {
    this.globalUserStateService.clearUserData();
    this.authProcessStateService.clearAuthData();
    this.route.navigate(['/'], { replaceUrl: true });
  }
}
