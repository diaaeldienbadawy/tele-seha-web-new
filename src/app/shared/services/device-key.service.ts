import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DeviceKeyService {
  private KEY = 'deviceKey';

  getDeviceKey(): string {
    let deviceKey = localStorage.getItem(this.KEY) || this.getCookie(this.KEY);

    if (!deviceKey) {
      deviceKey = crypto.randomUUID();

      localStorage.setItem(this.KEY, deviceKey);
      this.setCookie(this.KEY, deviceKey, 365);
    }

    return deviceKey;
  }

  private setCookie(name: string, value: string, days: number) {
    const date = new Date();
    date.setTime(date.getTime() + days * 86400000);

    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
  }

  private getCookie(name: string): string | null {
    const cookies = document.cookie.split(';');

    for (let c of cookies) {
      const [key, val] = c.trim().split('=');
      if (key === name) return val;
    }

    return null;
  }
}
