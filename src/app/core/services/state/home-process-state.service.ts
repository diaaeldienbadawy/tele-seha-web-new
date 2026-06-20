import { Injectable, signal } from '@angular/core';

@Injectable()
export class HomeProcessStateService {
  private _patients = signal<any[]>([]);
  readonly patients = this._patients.asReadonly();

  hydrateFromLoginResponse(res: any): void {
    if (res?.data?.user?.patients?.length > 0) {
      this._patients.set(res.data.user.patients);
    }
  }

  setPatients(patients: any[]): void {
    this._patients.set(patients);
  }
}
