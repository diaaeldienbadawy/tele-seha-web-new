import { Injectable, signal } from '@angular/core';

@Injectable()
export class AuthProcessStateService {
  private _mobile = signal<string>('');
  readonly mobile = this._mobile.asReadonly();

  private _createPasswordToken = signal<string>('');
  readonly createPasswordToken = this._createPasswordToken.asReadonly();

  setMobile(mobile: string): void {
    this._mobile.set(mobile);
  }

  setCreatePasswordToken(token: string): void {
    this._createPasswordToken.set(token);
    // Optionally also set as cookie if needed for legacy reasons, 
    // but preferably just keep it in memory
    if (typeof document !== 'undefined' && token) {
      document.cookie = `createPasswordToken=${token};path=/;`;
    }
  }

  clearAuthData(): void {
    this._mobile.set('');
    this._createPasswordToken.set('');
    if (typeof document !== 'undefined') {
      document.cookie = 'createPasswordToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    }
  }
}
