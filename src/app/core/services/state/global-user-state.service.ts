import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { decodeJwtPayload, JwtUserClaims, getJwtUserDetails } from '../../utils/jwt.utils';

@Injectable({
  providedIn: 'root',
})
export class GlobalUserStateService {

  // Stored in localStorage
  private _refreshToken = signal<string>('');
  readonly refreshToken = this._refreshToken.asReadonly();

  // Stored in memory only
  private _accessToken = signal<string>('');
  readonly accessToken = this._accessToken.asReadonly();

  private _role = signal<string | null>(null);
  readonly role = this._role.asReadonly();

  private _userId = signal<string | null>(null);
  readonly userId = this._userId.asReadonly();

  private _nextStepEnum = signal<string>('');
  readonly nextStepEnum = this._nextStepEnum.asReadonly();

  // User details
  private _userName = signal<string>('');
  readonly userName = this._userName.asReadonly();

  // Doctor Data (Populated if user has a doctor profile)
  private _doctorId = signal<string>('');
  readonly doctorId = this._doctorId.asReadonly();
  
  private _doctorName = signal<string>('');
  readonly doctorName = this._doctorName.asReadonly();

  private _doctorImage = signal<string>('');
  readonly doctorImage = this._doctorImage.asReadonly();

  // Patient Data (Populated if user has patient profiles)
  private _patientId = signal<string>('');
  readonly patientId = this._patientId.asReadonly();

  private _patientName = signal<string>('');
  readonly patientName = this._patientName.asReadonly();

  private _loggedInPatientId = signal<string | null>(null);
  readonly loggedInPatientId = this._loggedInPatientId.asReadonly();

  private _patients = signal<any[]>([]);
  readonly patients = this._patients.asReadonly();

  private _isInitialized = signal<boolean>(false);
  readonly isInitialized = this._isInitialized.asReadonly();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const storedRefreshToken = localStorage.getItem('refreshToken') || '';
      this._refreshToken.set(storedRefreshToken);
    }
  }

  hydrateFromLoginResponse(res: any): void {
    if (res?.data?.accessToken) {
      this._accessToken.set(res.data.accessToken);
    }
    
    if (res?.data?.refreshToken) {
      this._refreshToken.set(res.data.refreshToken);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('refreshToken', res.data.refreshToken);
      }
    }

    if (res?.nextStep) {
      this._nextStepEnum.set(res.nextStep);
    }

    if (res?.data?.user?.role) {
      this._role.set(res.data.user.role);
    }

    if (res?.data?.user?.name) {
       this._userName.set(res.data.user.name);
    }

    // Doctor Data
    if (res?.data?.user?.doctor) {
      const doctor = res.data.user.doctor;
      this._doctorId.set(doctor.doctorId?.toString() || '');
      this._doctorName.set(doctor.name || '');
      this._doctorImage.set(doctor.imageUrl || '');
    }

    // Patient Data
    if (res?.data?.user?.patients?.length > 0) {
      const firstPatient = res.data.user.patients[0];
      this._patientName.set(firstPatient.name || '');
      this._patientId.set(firstPatient.patientId?.toString() || '');
      this._loggedInPatientId.set(firstPatient.patientId?.toString() || null);
      this._patients.set(res.data.user.patients);
    }

    if (!res?.data?.user?.role && res?.data?.accessToken) {
      const payload = decodeJwtPayload<JwtUserClaims>(res.data.accessToken);
      const details = getJwtUserDetails(payload);
      if (details?.role) this._role.set(details.role);
      if (details?.userId) this._userId.set(details.userId);
    }

    this._isInitialized.set(true);
  }

  hydrateNextStep(nextStep: string) {
    if (nextStep) {
      this._nextStepEnum.set(nextStep);
    }
  }

  selectPatientProfile(patientId: string, patientName: string) {
    this._patientId.set(patientId);
    this._patientName.set(patientName);
    this._loggedInPatientId.set(patientId);
  }

  setRefreshToken(token: string): void {
    this._refreshToken.set(token);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('refreshToken', token);
    }
  }

  clearUserData(): void {
    this._accessToken.set('');
    this._refreshToken.set('');
    this._role.set(null);
    this._userId.set(null);
    this._nextStepEnum.set('');
    this._userName.set('');
    this._doctorId.set('');
    this._doctorName.set('');
    this._doctorImage.set('');
    this._patientName.set('');
    this._patientId.set('');
    this._loggedInPatientId.set(null);
    this._patients.set([]);
    this._isInitialized.set(false);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('refreshToken');
    }

    if (typeof document !== 'undefined') {
      document.cookie = 'createPasswordToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    }
  }
}
