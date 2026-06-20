import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import { Environment } from '../../../../environments/environment.development';
import { from, Observable } from 'rxjs';
import { deflate } from 'pako';

@Injectable({
  providedIn: 'root'
})
export class AgoraService {
  private platformId = inject(PLATFORM_ID);
  private _client: IAgoraRTCClient | null = null;
  private readonly encoder = new TextEncoder();

  generateToken(sessionId: string | number, uid: string | number, expire = 86400): Observable<any> {
    const channelName = `session-teleseha-${sessionId}`;
    return from(this.buildTokenPayload(channelName, uid, expire));
  }

  private async buildTokenPayload(
    channelName: string,
    uid: string | number,
    expire: number
  ): Promise<{ token: string; channel: string; app_id: string; uid: number }> {
    const appId = Environment.agoraAppId;
    const certificate = Environment.agoraCertificateId;
    const uidNum = Number(uid) || 0;
    const token = await this.buildToken(appId, certificate, channelName, uidNum, expire);
    return {
      token,
      channel: channelName,
      app_id: appId,
      uid: uidNum,
    };
  }

  private async buildToken(
    appId: string,
    certificate: string,
    channel: string,
    uid: number,
    ttl: number
  ): Promise<string> {
    const uidStr = uid === 0 ? '' : String(uid);
    const issueTs = Math.floor(Date.now() / 1000);
    const salt = Math.floor(Math.random() * 99999999) + 1;
    const expire = ttl;

    const privileges: Record<number, number> = {
      1: expire,
      2: expire,
      3: expire,
      4: expire,
    };

    const serviceBlock = this.concatBytes(
      this.packUint16(1),
      this.packMapUint32(privileges),
      this.packString(channel),
      this.packString(uidStr)
    );

    const message = this.concatBytes(
      this.packString(appId),
      this.packUint32(issueTs),
      this.packUint32(expire),
      this.packUint32(salt),
      this.packUint16(1),
      serviceBlock
    );

    const key1 = await this.hmacSha256(this.packUint32(issueTs), this.encoder.encode(certificate));
    const key2 = await this.hmacSha256(this.packUint32(salt), key1);
    const signature = await this.hmacSha256(key2, message);

    const signing = this.packBytes(signature);
    const compressed = deflate(this.concatBytes(signing, message));
    return '007' + this.toBase64(compressed);
  }

  private packUint16(value: number): Uint8Array {
    const out = new Uint8Array(2);
    new DataView(out.buffer).setUint16(0, value, true);
    return out;
  }

  private packUint32(value: number): Uint8Array {
    const out = new Uint8Array(4);
    new DataView(out.buffer).setUint32(0, value >>> 0, true);
    return out;
  }

  private packString(value: string): Uint8Array {
    return this.packBytes(this.encoder.encode(value));
  }

  private packBytes(bytes: Uint8Array): Uint8Array {
    return this.concatBytes(this.packUint16(bytes.length), bytes);
  }

  private packMapUint32(map: Record<number, number>): Uint8Array {
    const keys = Object.keys(map).map(Number);
    const parts: Uint8Array[] = [this.packUint16(keys.length)];
    for (const key of keys) {
      parts.push(this.packUint16(key));
      parts.push(this.packUint32(map[key]));
    }
    return this.concatBytes(...parts);
  }

  private concatBytes(...chunks: Uint8Array[]): Uint8Array {
    const total = chunks.reduce((sum, c) => sum + c.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      out.set(chunk, offset);
      offset += chunk.length;
    }
    return out;
  }

  private async hmacSha256(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
    const keyBuffer = key.buffer.slice(key.byteOffset, key.byteOffset + key.byteLength) as ArrayBuffer;
    const messageBuffer = message.buffer.slice(
      message.byteOffset,
      message.byteOffset + message.byteLength
    ) as ArrayBuffer;
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageBuffer);
    return new Uint8Array(signature);
  }

  private toBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  get client(): IAgoraRTCClient {
    if (!this._client) {
      throw new Error('Agora client not initialized. Call joinChannel() first.');
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
    if (!this._client) {
      const AgoraRTC = await import('agora-rtc-sdk-ng');
      this._client = AgoraRTC.default.createClient({ mode: 'rtc', codec: 'vp8' });
    } else if (this._client.connectionState !== 'DISCONNECTED') {
      await this._client.leave();
    }

    console.log({appId: Environment.agoraAppId, channel, token, uid});
    await this._client.join(Environment.agoraAppId, channel, token, uid);
  }

  async leaveChannel() {
    if (this._client && this._client.connectionState !== 'DISCONNECTED') {
      await this._client.leave();
    }
  }
}
