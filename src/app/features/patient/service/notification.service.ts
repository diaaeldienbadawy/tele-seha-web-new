import { inject, Injectable, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { Environment } from '../../../../environments/environment.development';
import { LocalstorageService } from '../../../core/services/localstorage.service';
import type { TeleSehaNotificationListItem } from '../models/notification.models';

@Injectable({
  providedIn: 'root',
})
export class NotificationService implements OnDestroy {
  isNoReadNotif = signal<boolean>(false);

  notifications$ = new BehaviorSubject<TeleSehaNotificationListItem[]>([]);

  private hubConnection: signalR.HubConnection | null = null;
  private platformId = inject(PLATFORM_ID);
  private activeHubKey: string | null = null;
  private localStorageService = inject(LocalstorageService);

  constructor(private http: HttpClient) {}

  private _authHeaders(): { headers: { Authorization: string } } | undefined {
    if (!isPlatformBrowser(this.platformId)) return undefined;
    const token = this.localStorageService.accessToken();
    if (!token) return undefined;
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  private _parseNotificationsResponse(res: unknown): unknown[] {
    if (Array.isArray(res)) return res;
    const inner =
      (res as { data?: unknown; notifications?: unknown })?.data ??
      (res as { notifications?: unknown })?.notifications ??
      [];
    return Array.isArray(inner) ? inner : [];
  }

  private _normalizeRestItem(raw: unknown): TeleSehaNotificationListItem | null {
    if (raw == null || typeof raw !== 'object') return null;
    const o = raw as Record<string, unknown>;
    const type = typeof o['type'] === 'string' ? o['type'] : 'Unknown';
    const title = typeof o['title'] === 'string' ? o['title'] : '';
    const message = typeof o['message'] === 'string' ? o['message'] : '';
    const data = 'data' in o ? o['data'] : undefined;
    return { type, title, message, data };
  }

  private _mapLivePayloadToListItem(payload: unknown): TeleSehaNotificationListItem {
    const p = (payload ?? {}) as Record<string, unknown>;
    const data = p['data'];
    const event = typeof p['event'] === 'string' ? p['event'] : '';
    const eventType = typeof p['eventType'] === 'string' ? p['eventType'] : '';

    if (typeof p['title'] === 'string' && typeof p['message'] === 'string') {
      return {
        type:
          typeof p['type'] === 'string' ? p['type'] : event || eventType || 'Live',
        title: p['title'],
        message: p['message'],
        data: data ?? null,
        _clientId: this._newClientId(),
      };
    }

    if (data != null && typeof data === 'object' && !Array.isArray(data)) {
      const d = data as Record<string, unknown>;
      const title =
        typeof d['title'] === 'string'
          ? d['title']
          : event || eventType || 'Notification';
      const message =
        typeof d['message'] === 'string'
          ? d['message']
          : typeof d['body'] === 'string'
            ? d['body']
            : '';
      const type =
        typeof d['type'] === 'string' ? d['type'] : event || eventType || 'Live';
      return {
        type,
        title,
        message,
        data,
        _clientId: this._newClientId(),
      };
    }

    const message =
      typeof data === 'string'
        ? data
        : data != null
          ? JSON.stringify(data)
          : '';

    return {
      type: event || eventType || 'Live',
      title: event || eventType || 'Notification',
      message,
      data: data ?? null,
      _clientId: this._newClientId(),
    };
  }

  private _newClientId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `n-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  private _applyNotificationList(rawList: unknown[]): void {
    const notifications = rawList
      .map((n) => this._normalizeRestItem(n))
      .filter((n): n is TeleSehaNotificationListItem => n != null);
    this.isNoReadNotif.set(false);
    this.notifications$.next(notifications);
  }

  getPatientNotifications(patientId: string): Observable<unknown> {
    return this.http.get<unknown>(
      `${Environment.apiUrl}/api/notification/${patientId}`,
      this._authHeaders()
    );
  }

  getDoctorNotifications(doctorId: string): Observable<unknown> {
    return this.http.get<unknown>(
      `${Environment.apiUrl}/api/notification/doctor-app/${doctorId}`,
      this._authHeaders()
    );
  }

  startPatientConnection(patientId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.getPatientNotifications(patientId).subscribe({
      next: (res: unknown) => {
        this._applyNotificationList(this._parseNotificationsResponse(res));
      },
      error: (err) =>
        console.error('[NotificationService] Failed to load patient notifications:', err),
    });

    this._connectNotificationHub('patient', Environment.patientnotificationHubUrl, patientId);
  }

  startDoctorConnection(doctorId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.getDoctorNotifications(doctorId).subscribe({
      next: (res: unknown) => {
        this._applyNotificationList(this._parseNotificationsResponse(res));
      },
      error: (err) =>
        console.error('[NotificationService] Failed to load doctor notifications:', err),
    });

    this._connectNotificationHub('doctor', Environment.doctornotificationHubUrl, doctorId);
  }

  private _connectNotificationHub(
    kind: 'patient' | 'doctor',
    hubUrl: string,
    id: string
  ): void {
    const hubKey = `${kind}:${id}`;
    if (
      this.hubConnection &&
      this.activeHubKey === hubKey &&
      this.hubConnection.state === signalR.HubConnectionState.Connected
    ) {
      return;
    }

    if (this.hubConnection) {
      this.stopConnection();
    }

    this.activeHubKey = hubKey;
    const query =
      kind === 'patient'
        ? `patientId=${encodeURIComponent(id)}`
        : `doctorId=${encodeURIComponent(id)}`;
    const url = `${hubUrl}?${query}`;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => this.localStorageService.accessToken(),
        withCredentials: false,
        transport: signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.hubConnection
      .start()
      .then(() => {
        this._registerEvents();
      })
      .catch((err) => {
        console.error('[NotificationService] SignalR connection error:', err);
        this.hubConnection = null;
        this.activeHubKey = null;
      });
  }

  private _registerEvents(): void {
    if (!this.hubConnection) return;

    this.hubConnection.on('ReceiveNotification', (payload: unknown) => {
      const notification = this._mapLivePayloadToListItem(payload);
      const current = this.notifications$.getValue();
      const next = [notification, ...current];
      this.notifications$.next(next);
      this.isNoReadNotif.set(true);

      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(notification.title || 'New notification', {
          body: notification.message || '',
          icon: `${location.origin}/images/logo.png`,
        });
      }
    });

    this.hubConnection.onreconnecting(() =>
      console.warn('[NotificationService] SignalR reconnecting...')
    );

    this.hubConnection.onreconnected(() =>
      console.log('[NotificationService] SignalR reconnected.')
    );

    this.hubConnection.onclose((err) => {
      if (err) console.error('[NotificationService] SignalR closed with error:', err);
    });
  }

  markAllRead(): void {
    this.isNoReadNotif.set(false);
  }

  stopConnection(): void {
    this.hubConnection
      ?.stop()
      .catch((err) => console.error('[NotificationService] Error stopping SignalR:', err));
    this.hubConnection = null;
    this.activeHubKey = null;
  }

  ngOnDestroy(): void {
    this.stopConnection();
  }
}
