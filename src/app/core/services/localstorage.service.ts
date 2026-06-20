import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { decodeJwtPayload, JwtUserClaims, getJwtUserDetails } from '../utils/jwt.utils';

@Injectable({
  providedIn: 'root',
})
export class LocalstorageService {

  // === الـ State الجديد ===

  // الحاجة الوحيدة في localStorage
  // refreshToken → يتخزن/يتجاب من localStorage

  // كل حاجة تانية في الـ Memory فقط:
  private _accessToken = signal<string>('');
  readonly accessToken = this._accessToken.asReadonly();

  private _refreshToken = signal<string>('');
  readonly refreshToken = this._refreshToken.asReadonly();

  private _role = signal<string | null>(null);
  readonly role = this._role.asReadonly();

  private _userId = signal<string | null>(null);
  readonly userId = this._userId.asReadonly();

  private _nextStepEnum = signal<string>('');
  readonly nextStepEnum = this._nextStepEnum.asReadonly();

  private _doctorId = signal<string>('');
  readonly doctorId = this._doctorId.asReadonly();

  private _doctorName = signal<string>('');
  readonly doctorName = this._doctorName.asReadonly();

  private _doctorImage = signal<string>('');
  readonly doctorImage = this._doctorImage.asReadonly();

  private _patientName = signal<string>('');
  readonly patientName = this._patientName.asReadonly();

  private _patientId = signal<string>('');
  readonly patientId = this._patientId.asReadonly();

  private _loggedInPatientId = signal<string | null>(null);
  readonly loggedInPatientId = this._loggedInPatientId.asReadonly();

  private _patients = signal<any[]>([]);
  readonly patients = this._patients.asReadonly();

  private _mobile = signal<string>('');
  readonly mobile = this._mobile.asReadonly();

  private _isInitialized = signal<boolean>(false);
  readonly isInitialized = this._isInitialized.asReadonly();

  // Backward compatibility — subscribe على الـ signal
  readonly patientName$ = toObservable(this._patientName);
  readonly doctorImage$ = toObservable(this._doctorImage);
  readonly doctorName$ = toObservable(this._doctorName);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // في البداية، الحاجة الوحيدة اللي نقراها من localStorage هي الـ refreshToken
    if (isPlatformBrowser(this.platformId)) {
      const storedRefreshToken = localStorage.getItem('refreshToken') || '';
      this._refreshToken.set(storedRefreshToken);
    }
  }

  /**
   * بتتنادى بعد أي login/refresh ناجح.
   * بتملأ كل الـ in-memory state من الـ API response.
   */
  hydrateFromLoginResponse(res: any): void {
    // Tokens
    if (res?.data?.accessToken) {
      this._accessToken.set(res.data.accessToken);
    }
    if (res?.data?.refreshToken) {
      this._refreshToken.set(res.data.refreshToken);
      // الـ refreshToken هو الحاجة الوحيدة اللي بنحفظها في localStorage
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('refreshToken', res.data.refreshToken);
      }
    }

    // NextStep
    if (res?.nextStep) {
      this._nextStepEnum.set(res.nextStep);
    }

    // Role
    if (res?.data?.user?.role) {
      this._role.set(res.data.user.role);
    }

    // Doctor data
    if (res?.data?.user?.doctor) {
      const doctor = res.data.user.doctor;
      this._doctorId.set(doctor.doctorId?.toString() || '');
      this._doctorName.set(doctor.name || '');
      this._doctorImage.set(doctor.imageUrl || '');
    }

    // Patient data
    if (res?.data?.user?.patients?.length > 0) {
      const firstPatient = res.data.user.patients[0];
      this._patientName.set(firstPatient.name || '');
      this._patientId.set(firstPatient.patientId?.toString() || '');
      this._loggedInPatientId.set(firstPatient.patientId?.toString() || null);
      this._patients.set(res.data.user.patients);
    }

    // Role from JWT if not in response
    if (!res?.data?.user?.role && res?.data?.accessToken) {
      const payload = decodeJwtPayload<JwtUserClaims>(res.data.accessToken);
      const details = getJwtUserDetails(payload);
      if (details?.role) this._role.set(details.role);
      if (details?.userId) this._userId.set(details.userId);
    }

    this._isInitialized.set(true);
  }

  /**
   * بتتنادى بعد خطوات التسجيل (basicInfo, doctorProfile, certificates).
   * الـ registration responses مبترجعش tokens جديدة — بس بتحدث nextStep و data.
   */
  hydrateFromRegistrationResponse(res: any): void {
    if (res?.nextStep) {
      this._nextStepEnum.set(res.nextStep);
    }
    if (res?.data?.doctorId) {
      this._doctorId.set(res.data.doctorId.toString());
    }
    if (res?.data?.Image || res?.data?.image) {
      this._doctorImage.set(res.data.Image || res.data.image);
    }
  }

  setAccessToken(token: string): void { this._accessToken.set(token); }
  setRefreshToken(token: string): void {
    this._refreshToken.set(token);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('refreshToken', token);
    }
  }
  setNextStepEnum(step: string): void { this._nextStepEnum.set(step); }
  setRole(role: string): void { this._role.set(role); }
  setDoctorId(id: string): void { this._doctorId.set(id); }
  setDoctorNameValue(name: string): void { this._doctorName.set(name); }
  setDoctorImageValue(image: string): void { this._doctorImage.set(image); }
  setPatientNameValue(name: string): void { this._patientName.set(name); }
  setPatientId(id: string): void { this._patientId.set(id); }
  setLoggedInPatientId(id: string | null): void { this._loggedInPatientId.set(id); }
  setPatients(patients: any[]): void { this._patients.set(patients); }
  setMobile(mobile: string): void { this._mobile.set(mobile); }

  clearUserData(): void {
    this._accessToken.set('');
    this._refreshToken.set('');
    this._role.set(null);
    this._userId.set(null);
    this._nextStepEnum.set('');
    this._doctorId.set('');
    this._doctorName.set('');
    this._doctorImage.set('');
    this._patientName.set('');
    this._patientId.set('');
    this._loggedInPatientId.set(null);
    this._patients.set([]);
    this._mobile.set('');
    this._isInitialized.set(false);

    // امسح الـ refreshToken من localStorage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('refreshToken');
    }

    // امسح الـ cookie
    if (typeof document !== 'undefined') {
      document.cookie = 'createPasswordToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    }
  }

  /** @deprecated — استخدم الـ signals مباشرة */
  get(key: string): string {
    switch (key) {
      case 'accessToken': return this._accessToken();
      case 'refreshToken': return this._refreshToken();
      case 'role': return this._role() || '';
      case 'nextStepEnum': return this._nextStepEnum();
      case 'doctorId': return this._doctorId();
      case 'doctorName': return this._doctorName();
      case 'doctorImage': return this._doctorImage();
      case 'patientName': return this._patientName();
      case 'patientId': return this._patientId();
      case 'loggedInPatientId': return this._loggedInPatientId() || '';
      case 'mobile': return this._mobile();
      default: return '';
    }
  }

  /** @deprecated — استخدم الـ setters مباشرة */
  set(key: string, value: string): void {
    switch (key) {
      case 'accessToken': this._accessToken.set(value); break;
      case 'refreshToken': this.setRefreshToken(value); break;
      case 'role': this._role.set(value || null); break;
      case 'nextStepEnum': this._nextStepEnum.set(value); break;
      case 'doctorId': this._doctorId.set(value); break;
      case 'doctorName': this._doctorName.set(value); break;
      case 'doctorImage': this._doctorImage.set(value); break;
      case 'patientName': this._patientName.set(value); break;
      case 'patientId': this._patientId.set(value); break;
      case 'loggedInPatientId': this._loggedInPatientId.set(value || null); break;
      case 'mobile': this._mobile.set(value); break;
    }
  }

  remove(key: string): void {
    switch (key) {
      case 'accessToken': this._accessToken.set(''); break;
      case 'refreshToken': this.setRefreshToken(''); break;
      case 'role': this._role.set(null); break;
      case 'nextStepEnum': this._nextStepEnum.set(''); break;
      case 'doctorId': this._doctorId.set(''); break;
      case 'doctorName': this._doctorName.set(''); break;
      case 'doctorImage': this._doctorImage.set(''); break;
      case 'patientName': this._patientName.set(''); break;
      case 'patientId': this._patientId.set(''); break;
      case 'loggedInPatientId': this._loggedInPatientId.set(null); break;
      case 'mobile': this._mobile.set(''); break;
    }
  }

  setPatientName(name: string) { this.setPatientNameValue(name); }
  setDoctorImage(image: string) { this.setDoctorImageValue(image); }
  setDoctorName(name: string) { this.setDoctorNameValue(name); }

  getPatients(): any[] {
    return this._patients();
  }
}
