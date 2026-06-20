import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { INextStepEnum } from '../../../../core/models/nextStepEnum';
import { IphoneValidator } from '../../../../core/models/phone.validator';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { DoctorAuthService } from '../../service/doctor-auth.service';
import { Router, RouterLink } from '@angular/router';
import { AuthLogoComponent } from '../../../../shared/components/auth-logo/auth-logo.component';
import { AuthLeftSideComponent } from '../../../../shared/components/auth-left-side/auth-left-side.component';

@Component({
  selector: 'app-forget-password',
  imports: [
    AuthLogoComponent,
    AuthLeftSideComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css',
})
export class ForgetPasswordComponent {
  isLoading: boolean = false;

  constructor(
    readonly doctorAuthService: DoctorAuthService,
    readonly fb: FormBuilder,
    readonly route: Router,
    readonly toaster: ToastrService,
    readonly localStorageService: LocalstorageService,
  ) {}

  mobileForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.mobileForm = this.fb.group({
      mobile: ['', [Validators.required, IphoneValidator()]],
    });
  }

  submit() {
    if (this.mobileForm.invalid) {
      this.mobileForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.doctorAuthService.loginMobile(this.mobileForm.value.mobile).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.localStorageService.setNextStepEnum(res.nextStep);
        this.localStorageService.setMobile(this.mobileForm.value.mobile);

        switch (res.nextStep) {
          case INextStepEnum.OtpConfirm:
            this.toaster.success('OTP Sent Successfully');
            this.route.navigate(['doctor/auth/verify-otp'], { replaceUrl: true });
            break;
          case INextStepEnum.Login:
            this.route.navigate(['doctor/auth/password'], { replaceUrl: true });
            break;
          case INextStepEnum.CreatePassword:
            this.route.navigate(['doctor/auth/password'], { replaceUrl: true });
            break;
          case INextStepEnum.OpenHome:
            this.route.navigate(['doctor/home'], { replaceUrl: true });
            break;
          default:
            this.localStorageService.setNextStepEnum(res.nextStep);
            break;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  clearLocalStorage() {
    this.localStorageService.clearUserData();
    this.route.navigate(['/'], { replaceUrl: true });
  }
}
