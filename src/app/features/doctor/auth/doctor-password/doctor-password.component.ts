import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthLeftSideComponent } from '../../../../shared/components/auth-left-side/auth-left-side.component';
import { AuthLogoComponent } from '../../../../shared/components/auth-logo/auth-logo.component';
import { ToastrService } from 'ngx-toastr';
import { INextStepEnum } from '../../../../core/models/nextStepEnum';
import { GlobalUserStateService } from '../../../../core/services/state/global-user-state.service';
import { AuthProcessStateService } from '../../../../core/services/state/auth-process-state.service';
import {
  IpatientLoginRequest,
  IcreatePasswordRequest,
} from '../../../../shared/interface/patient-login';
import { DoctorAuthService } from '../../service/doctor-auth.service';

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

@Component({
  selector: 'app-doctor-password',
  imports: [RouterLink, CommonModule, AuthLogoComponent, AuthLeftSideComponent],
  templateUrl: './doctor-password.component.html',
  styleUrl: './doctor-password.component.css',
})
export class DoctorPasswordComponent implements OnInit {
  mobile: string = '';
  nextStepEnum: string = '';
  createPasswordToken: string = '';
  isLoading = false;

  constructor(
    readonly route: Router,
    readonly doctorAuthtService: DoctorAuthService,
    readonly globalUserStateService: GlobalUserStateService,
    readonly authProcessStateService: AuthProcessStateService,
    readonly toastr: ToastrService,
  ) {
    this.mobile = this.authProcessStateService.mobile();
    this.nextStepEnum = this.globalUserStateService.nextStepEnum();
  }

  ngOnInit(): void {
    if (this.nextStepEnum === INextStepEnum.CreatePassword) {
      this.createPasswordToken = this.getCookie('createPasswordToken') || '';
      if (!this.createPasswordToken) {
        this.toastr.warning('Please enter your mobile number first');
        this.route.navigate(['doctor/auth/login'], { replaceUrl: true });
      }
    }
  }

  // ================= Pattern Logic =================
  dots = new Array(9);
  selected: number[] = [];
  lines: Line[] = [];

  isDrawing = false;
  canConfirm = false;

  step: 1 | 2 = 1;
  isAnimatingStep = false;

  firstPattern: number[] = [];
  error = false;
  success = false;

  positions = [
    { x: 50, y: 50 },
    { x: 150, y: 50 },
    { x: 250, y: 50 },
    { x: 50, y: 150 },
    { x: 150, y: 150 },
    { x: 250, y: 150 },
    { x: 50, y: 250 },
    { x: 150, y: 250 },
    { x: 250, y: 250 },
  ];

  // ================= Drawing =================
  start(event?: MouseEvent | TouchEvent) {
    if (this.isAnimatingStep || this.isLoading) return;

    if (event instanceof TouchEvent) {
      event.preventDefault();
    }

    this.isDrawing = true;
    this.selected = [];
    this.lines = [];
    this.error = false;
    this.canConfirm = false;
  }

  move(event: MouseEvent | TouchEvent) {
    if (!this.isDrawing || this.isAnimatingStep || this.isLoading) return;

    if (event instanceof TouchEvent) {
      event.preventDefault();
    }

    const point = this.getPoint(event);

    this.positions.forEach((pos, index) => {
      const distance = Math.hypot(pos.x - point.x, pos.y - point.y);

      if (distance < 30 && !this.selected.includes(index)) {
        if (this.selected.length > 0) {
          const last = this.positions[this.selected[this.selected.length - 1]];
          this.lines.push({
            x1: last.x,
            y1: last.y,
            x2: pos.x,
            y2: pos.y,
          });
        }
        this.selected.push(index);
      }
    });
  }

  end() {
    if (!this.isDrawing) return;
    this.isDrawing = false;

    if (this.selected.length >= 3) {
      this.canConfirm = true;
    }
  }

  // ================= Confirm =================
  confirmPattern() {
    if (!this.canConfirm || this.isAnimatingStep || this.isLoading) return;

    if (this.nextStepEnum !== INextStepEnum.CreatePassword) {
      this.loginWithPattern();
      return;
    }

    if (this.step === 1) {
      this.isAnimatingStep = true;
      setTimeout(() => {
        this.firstPattern = [...this.selected];
        this.step = 2;
        this.resetDrawOnly();
        setTimeout(() => {
          this.isAnimatingStep = false;
        }, 50);
      }, 250);
      return;
    }

    const confirmPattern = [...this.selected];

    const isMatch =
      this.firstPattern.length === confirmPattern.length &&
      this.firstPattern.every((v, i) => v === confirmPattern[i]);

    if (!isMatch) {
      this.error = true;
      this.success = false;
      this.step = 1;
      this.resetDrawOnly();
      return;
    }

    this.createPassword();
  }

  private loginWithPattern() {
    const pattern = this.selected.join('');

    const payload: IpatientLoginRequest = {
      password: pattern,
      mobile: this.mobile,
    };

    this.isLoading = true;

    this.doctorAuthtService.login(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.globalUserStateService.hydrateFromLoginResponse(res);

        switch (res.nextStep) {
          case INextStepEnum.CreatePassword:
            this.route.navigate(['doctor/auth/password'], { replaceUrl: true });
            break;
          case INextStepEnum.CreateProfile:
            this.route.navigate(['doctor/auth/register/basicInfo'], { replaceUrl: true });
            break;
          case INextStepEnum.CreateDoctorProfile:
            this.route.navigate(['doctor/auth/register/createProfile'], { replaceUrl: true });
            break;
          case INextStepEnum.CreateDoctorCertificates:
            this.route.navigate(['doctor/auth/register/createCertificates'], { replaceUrl: true });
            break;
          case INextStepEnum.CreateDoctorSchedules:
            this.route.navigate(['doctor/auth/register/appointment'], { replaceUrl: true });
            break;
          case INextStepEnum.WaitForAcctivation:
            this.toastr.warning('Please Wait For Activation');
            this.route.navigate(['doctor/auth/watingForAcctivation'], { replaceUrl: true });
            break;
          case INextStepEnum.OpenHome:
            this.route.navigate(['doctor/home'], { replaceUrl: true });
            break;
          default:
            break;
        }
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private createPassword() {
    const finalPattern = this.firstPattern.join('');

    const payload: IcreatePasswordRequest = {
      password: finalPattern,
      mobile: this.mobile,
      createPasswordToken: this.createPasswordToken,
    };

    this.isLoading = true;

    this.doctorAuthtService.createPassword(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.toastr.success('Password Created Successfully');
        this.globalUserStateService.hydrateFromLoginResponse(res);

        switch (res.nextStep) {
          case INextStepEnum.CreateProfile:
            this.route.navigate(['doctor/auth/register/basicInfo'], { replaceUrl: true });
            break;
          case INextStepEnum.CreateDoctorProfile:
            this.route.navigate(['doctor/auth/register/createProfile'], { replaceUrl: true });
            break;
          case INextStepEnum.CreateDoctorCertificates:
            this.route.navigate(['doctor/auth/register/createCertificates'], { replaceUrl: true });
            break;
          case INextStepEnum.OpenHome:
            this.route.navigate(['doctor/home'], { replaceUrl: true });
            break;
          default:
            break;
        }
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  resetDrawOnly() {
    this.selected = [];
    this.lines = [];
    this.canConfirm = false;
  }

  resetAll() {
    if (this.isAnimatingStep || this.isLoading) return;

    if (this.step === 2) {
      this.isAnimatingStep = true;
      setTimeout(() => {
        this.step = 1;
        this.firstPattern = [];
        this.error = false;
        this.success = false;
        this.resetDrawOnly();
        setTimeout(() => {
          this.isAnimatingStep = false;
        }, 50);
      }, 250);
    } else {
      this.step = 1;
      this.firstPattern = [];
      this.error = false;
      this.success = false;
      this.resetDrawOnly();
    }
  }

  getPoint(event: MouseEvent | TouchEvent) {
    const container = event.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();

    if (event instanceof TouchEvent) {
      const t = event.touches[0];
      return {
        x: t.clientX - rect.left,
        y: t.clientY - rect.top,
      };
    }

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
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
