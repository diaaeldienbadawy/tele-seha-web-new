import { Injectable, signal } from '@angular/core';

@Injectable()
export class DoctorRegistrationStateService {
  private _doctorId = signal<string>('');
  readonly doctorId = this._doctorId.asReadonly();

  private _doctorProfileId = signal<string>('');
  readonly doctorProfileId = this._doctorProfileId.asReadonly();

  private _doctorCertificatesId = signal<string>('');
  readonly doctorCertificatesId = this._doctorCertificatesId.asReadonly();

  private _doctorImage = signal<string>('');
  readonly doctorImage = this._doctorImage.asReadonly();

  hydrateFromRegistrationResponse(res: any): void {
    if (res?.data?.doctorId) {
      this._doctorId.set(res.data.doctorId.toString());
    }
    if (res?.data?.doctorProfileId) {
      this._doctorProfileId.set(res.data.doctorProfileId.toString());
    }
    if (res?.data?.doctorCertificatesId) {
      this._doctorCertificatesId.set(res.data.doctorCertificatesId.toString());
    }
    if (res?.data?.Image || res?.data?.image) {
      this._doctorImage.set(res.data.Image || res.data.image);
    }
  }

  setDoctorId(id: string): void {
    this._doctorId.set(id);
  }

  setDoctorProfileId(id: string): void {
    this._doctorProfileId.set(id);
  }

  setDoctorCertificatesId(id: string): void {
    this._doctorCertificatesId.set(id);
  }

  setDoctorImage(image: string): void {
    this._doctorImage.set(image);
  }

  clearRegistrationData(): void {
    this._doctorId.set('');
    this._doctorProfileId.set('');
    this._doctorCertificatesId.set('');
    this._doctorImage.set('');
  }
}
