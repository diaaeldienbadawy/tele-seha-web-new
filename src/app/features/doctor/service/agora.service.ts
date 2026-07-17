import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type { IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import { Environment } from '../../../../environments/environment.development';
import { map, Observable } from 'rxjs';

export interface RtcTokenResponse {
  token: string;
  channel: string;
  app_id: string;
  uid: number;
}

@Injectable({
  providedIn: 'root'
})
export class AgoraService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private _client: IAgoraRTCClient | null = null;

  /**
   * Fetches a fresh RTC token FROM THE BACKEND. The Agora app certificate is a secret and
   * must never live in the client bundle — the server derives the uid from the JWT and only
   * issues a token to the check-up's actual patient/doctor. `checkUpId` scopes the channel;
   * the `uid` argument is ignored (kept for call-site compatibility) since the server uses
   * the authenticated user id.
   */
  generateToken(checkUpId: string | number, _uid?: string | number): Observable<RtcTokenResponse> {
    return this.http
      .get<RtcTokenResponse>(`${Environment.apiUrl}/api/meeting/rtc-token/${checkUpId}`)
      .pipe(
        map((res) => ({
          token: res.token,
          channel: res.channel,
          app_id: res.app_id,
          uid: Number(res.uid) || 0,
        }))
      );
  }

  get client(): IAgoraRTCClient {
    if (!this._client) {
      throw new Error('Agora client not initialized. Call joinChannel() first.');
    }
    return this._client;
  }

  /**
   * بينشئ الـ client (لو لسه متعملش) من غير ما يعمل join.
   * مهم: لازم تتنادى قبل join عشان تسجّل listeners الـ user-published
   * قبل الانضمام، وبالتالي متفوتش الطرف اللي منشور قبلك.
   */
  async ensureClient(): Promise<IAgoraRTCClient> {
    if (!isPlatformBrowser(this.platformId)) {
      throw new Error('Agora is only available in the browser');
    }
    if (!this._client) {
      const AgoraRTC = await import('agora-rtc-sdk-ng');
      this._client = AgoraRTC.default.createClient({ mode: 'rtc', codec: 'vp8' });
    }
    return this._client;
  }

  async joinChannel(channel: string, token: string, uid: string | number | null = null) {
    if (!isPlatformBrowser(this.platformId)) {
      throw new Error('Agora is only available in the browser');
    }
    if (!token?.trim()) {
      throw new Error(
        'Agora RTC token is required (token missing or expired). Backend must issue a fresh RTC token when the user joins.'
      );
    }
    const client = await this.ensureClient();
    if (client.connectionState !== 'DISCONNECTED') {
      await client.leave();
    }

    await client.join(Environment.agoraAppId, channel, token, uid);
  }

  async leaveChannel() {
    if (this._client && this._client.connectionState !== 'DISCONNECTED') {
      await this._client.leave();
    }
  }
}
