import { Component } from '@angular/core';
import { AuthLogoComponent } from '../../../../shared/components/auth-logo/auth-logo.component';
import { AuthLeftSideComponent } from '../../../../shared/components/auth-left-side/auth-left-side.component';
import { Router } from '@angular/router';
import { PatientAuthService } from '../../service/patient-auth.service';
import { GlobalUserStateService } from '../../../../core/services/state/global-user-state.service';
import { AuthProcessStateService } from '../../../../core/services/state/auth-process-state.service';
import { CommonModule } from '@angular/common';
import {
  IcreatePasswordRequest,
  IpatientLoginRequest,
  IpatientLoginResponse,
} from '../../../../shared/interface/patient-login';
import { INextStepEnum } from '../../../../core/models/nextStepEnum';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

@Component({
  selector: 'app-patient-password',
  imports: [CommonModule, AuthLogoComponent, AuthLeftSideComponent, TranslateModule],
  templateUrl: './patient-password.component.html',
  styleUrl: './patient-password.component.css',
})
export class PatientPasswordComponent {
  mobile: string = '';
  nextStepEnum: string = '';
  createPasswordToken: string = '';
  isLoading: boolean = false;

  constructor(
    readonly route: Router,
    readonly patientService: PatientAuthService,
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
        this.route.navigate(['patient/auth/login'], { replaceUrl: true });
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
    if (this.isAnimatingStep || this.isLoading) return; // Prevent interaction during transition or loading

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
      event.preventDefault(); // 🔥 يمنع scroll
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
    if (!this.isDrawing || this.isLoading) return;
    this.isDrawing = false;

    if (this.selected.length >= 3) {
      this.canConfirm = true;
    }
  }

  // ================= Confirm =================
  confirmPattern() {
    if (!this.canConfirm || this.isAnimatingStep || this.isLoading) return;

    /** ================= LOGIN FLOW ================= */
    if (this.nextStepEnum !== INextStepEnum.CreatePassword) {
      this.loginWithPattern();
      return;
    }

    /** ================= CREATE PASSWORD FLOW ================= */

    // 🟢 أول مرة يرسم الباترن - مع انيميشن دوران 3D
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

    // 🟢 تأكيد الباترن
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

    // ✅ الباترن اتأكد → نكلم API مرة واحدة بس
    this.createPassword();
  }

  private loginWithPattern() {
    const pattern = this.selected.join('');

    const payload: IpatientLoginRequest = {
      password: pattern,
      mobile: this.mobile,
    };

    this.isLoading = true;
    this.patientService.login(payload).subscribe({
      next: (res: IpatientLoginResponse) => {
        this.isLoading = false;
        this.globalUserStateService.hydrateFromLoginResponse(res);

        switch (res.nextStep) {
          case INextStepEnum.CreatePassword:
            this.route.navigate(['patient/auth/password'], { replaceUrl: true });
            break;
          case INextStepEnum.CreateProfile:
            this.route.navigate(['patient/auth/register/basic-info'], { replaceUrl: true });
            break;
          case INextStepEnum.CreateMedicalProfile:
            this.route.navigate(['patient/auth/register/medical-history'], { replaceUrl: true });
            break;
          case INextStepEnum.SelectProfile:
            this.route.navigate(['patient/auth/register/select-profile'], { replaceUrl: true });
            break;
          case INextStepEnum.OpenHome:
            this.route.navigate(['patient/home'], { replaceUrl: true });
            break;
          default:
            break;
        }
      },
      error: () => {
        this.isLoading = false;
        this.resetDrawOnly();
      },
    });
  }

  private createPassword() {
    const finalPattern = this.firstPattern.join('');

    const payload: any = {
      password: finalPattern,
      mobile: this.mobile,
      createPasswordToken: this.createPasswordToken,
    };

    this.isLoading = true;
    this.patientService.createPassword(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.toastr.success('Password Created Successfully');
        this.globalUserStateService.hydrateFromLoginResponse(res);
        switch (res.nextStep) {
          case INextStepEnum.CreateProfile:
            this.route.navigate(['patient/auth/register/basic-info'], { replaceUrl: true });
            break;
          case INextStepEnum.CreateMedicalProfile:
            this.route.navigate(['patient/auth/register/medical-history'], { replaceUrl: true });
            break;
          case INextStepEnum.SelectProfile:
            this.route.navigate(['patient/auth/register/select-profile'], { replaceUrl: true });
            break;
          case INextStepEnum.OpenHome:
            this.route.navigate(['patient/home'], { replaceUrl: true });
            break;
          default:
            break;
        }
      },
      error: () => {
        this.isLoading = false;
        this.resetAll();
      },
    });
  }

  // ================= Reset =================
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

  // ================= Utils =================
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
