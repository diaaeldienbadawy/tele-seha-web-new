import { inject, Injectable, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { Environment } from '../../../../environments/environment.development';

export type ChatMediaUploadErrorKind =
  | 'unauthorized'
  | 'forbidden_checkup'
  | 'bad_request'
  | 'payload_too_large'
  | 'unsupported_media'
  | 'network'
  | 'unknown';

export interface ChatMediaUploadError {
  kind: ChatMediaUploadErrorKind;
  status: number;
  message: string;
}

function uploadHttpErrorBodyText(err: HttpErrorResponse): string {
  const e = err.error;
  if (typeof e === 'string' && e.trim()) return e.trim();
  if (e && typeof e === 'object') {
    const o = e as Record<string, unknown>;
    const t = o['title'] ?? o['detail'] ?? o['message'] ?? o['error'];
    if (typeof t === 'string' && t.trim()) return t.trim();
  }
  return err.message || String(err.status);
}

export enum ChatMessageType {
  Text = 1,
  SpecialImage = 2,
  Image = 3,
  File = 4
}

export function classifyChatMediaUploadHttpError(err: HttpErrorResponse): ChatMediaUploadError {
  const status = err.status;
  const message = uploadHttpErrorBodyText(err);
  const m = message.toLowerCase();
  let kind: ChatMediaUploadErrorKind = 'unknown';
  if (status === 401) kind = 'unauthorized';
  else if (status === 403) kind = 'forbidden_checkup';
  else if (status === 413) kind = 'payload_too_large';
  else if (status === 415) kind = 'unsupported_media';
  else if (status === 400) {
    if (
      /not part of (?:this|the) checkup|not part of this check-up|user is not part/i.test(m)
    ) {
      kind = 'forbidden_checkup';
    } else kind = 'bad_request';
  } else if (status === 0) kind = 'network';
  return { kind, status, message };
}

@Injectable({ providedIn: 'root' })
export class ChatService implements OnDestroy {

  conversations = signal<any[]>([]);
  messages = signal<any[]>([]);
  roomDetails = signal<any>(null);
  isConnected = signal<boolean>(false);
  unseenMessagesCount = signal<number>(0);

  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private hubConnection: signalR.HubConnection | null = null;
  private currentRoomId: string | number | null = null;
  private joinedSignalRGroup: string | null = null;
  private pendingRoomId: string | number | null = null;

  constructor() {}


  /** ChatMessage API (kebab routing → same as /api/ChatMessage/... on the server). */
  private readonly chatMessageApiBase = `${Environment.apiUrl}/api/chat-message`;

  private _chatAuthHeaders(): { headers: { Authorization: string } } | undefined {
    if (!isPlatformBrowser(this.platformId)) return undefined;
    const token = localStorage.getItem('accessToken') ?? '';
    if (!token) return undefined;
    return { headers: { Authorization: `Bearer ${token}` } };
  }


  private getChatMessages(
    checkupId: string,
    options?: { from?: string | number; count?: number }
  ): Observable<any> {
    let params = new HttpParams();
    if (options?.from != null && options.from !== '') {
      params = params.set('from', String(options.from));
    }
    if (options?.count != null) {
      params = params.set('count', String(options.count));
    }
    const q = params.keys().length ? { params } : {};
    return this.http.get<any>(`${this.chatMessageApiBase}/${checkupId}`, {
      ...q,
      ...this._chatAuthHeaders()
    });
  }


  uploadMedia(formData: FormData): Observable<Record<string, unknown>> {
    return this._postChatMultipart(`${this.chatMessageApiBase}/upload-media`, formData);
  }

  /** Doctor and patient: POST /api/chat-message/upload-media (multipart checkUpId + file). */
  uploadChatMedia(
    checkupId: string,
    file: File,
    options: { isDoctor?: boolean } = {}
  ): Observable<Record<string, unknown>> {
    void options;
    return this._uploadChatMediaWithFallbacks(checkupId, file);
  }

  private _postChatMultipart(
    url: string,
    fd: FormData
  ): Observable<Record<string, unknown>> {
    const httpOpts = { ...this._chatAuthHeaders(), responseType: 'text' as const };
    return this.http.post(url, fd, httpOpts).pipe(
      map((text: string | null) => this._parseUploadSuccessResponseText(text))
    );
  }


  private _parseUploadSuccessResponseText(text: string | null): Record<string, unknown> {
    const t = (text ?? '').trim();
    if (!t) return {};
    try {
      const v = JSON.parse(t) as unknown;
      if (typeof v === 'string') return { url: v };
      if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
        return { ...(v as Record<string, unknown>) };
      }
      return { raw: t };
    } catch {
      return { raw: t };
    }
  }

  private _shouldTryNextUploadShape(e: HttpErrorResponse): boolean {
    if (e.status === 404 || e.status === 415) return true;
    if (e.status === 400) {
      return classifyChatMediaUploadHttpError(e).kind !== 'forbidden_checkup';
    }
    return false;
  }

  private _formCheckUpAndFile(checkupId: string, file: File): FormData {
    const fd = new FormData();
    fd.append('checkUpId', String(checkupId));
    fd.append('file', file, file.name);
    return fd;
  }

  private _uploadChatMediaWithFallbacks(checkupId: string, file: File): Observable<Record<string, unknown>> {
    const base = this.chatMessageApiBase;
    const id = String(checkupId);
    const enc = encodeURIComponent(id);

    const post = (url: string, form: FormData) => this._postChatMultipart(url, form);

    const fdPrimary = this._formCheckUpAndFile(checkupId, file);
    const fdFileOnly = () => {
      const f = new FormData();
      f.append('file', file, file.name);
      return f;
    };
    const fdPascal = () => {
      const f = new FormData();
      f.append('CheckUpId', id);
      f.append('File', file, file.name);
      return f;
    };

    return post(`${base}/upload-media`, fdPrimary).pipe(
      catchError((e: HttpErrorResponse) =>
        this._shouldTryNextUploadShape(e)
          ? post(`${base}/${enc}/upload-media`, fdFileOnly())
          : throwError(() => e)
      ),
      catchError((e: HttpErrorResponse) =>
        this._shouldTryNextUploadShape(e)
          ? post(`${base}/upload-media?checkUpId=${enc}`, fdFileOnly())
          : throwError(() => e)
      ),
      catchError((e: HttpErrorResponse) =>
        this._shouldTryNextUploadShape(e) ? post(`${base}/upload-media`, fdPascal()) : throwError(() => e)
      )
    );
  }

  private _logHubError(action: string, err: unknown): void {
    const e = err as { message?: string };
    const text = e?.message ?? (typeof err === 'string' ? err : JSON.stringify(err));
    console.error(`[ChatService] ${action} failed — hub error:`, text, err);
  }

  startConnection(userId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.hubConnection) {
      this._flushPendingRoomJoin();
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${Environment.chatHubUrl}?userId=${userId}`, {
        accessTokenFactory: () =>
          isPlatformBrowser(this.platformId)
            ? localStorage.getItem('accessToken') ?? ''
            : '',
        withCredentials: false,
        transport: signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.hubConnection
      .start()
      .then(() => {
        this.isConnected.set(true);
        console.log('[ChatService] SignalR connected ✅');
        this._registerEvents();
        this._flushPendingRoomJoin();
      })
      .catch(err => {
        console.error('[ChatService] SignalR connection error:', err);
        this.isConnected.set(false);
      });

    this.hubConnection.onreconnecting(() => {
      this.isConnected.set(false);
      this.joinedSignalRGroup = null;
    });
    this.hubConnection.onreconnected(() => {
      this.isConnected.set(true);
      this.joinedSignalRGroup = null;
      if (this.currentRoomId != null) {
        void this._joinSignalRGroupForCheckup(String(this.currentRoomId)).catch(e =>
          this._logHubError('Re-JoinGroup', e)
        );
      } else {
        this._flushPendingRoomJoin();
      }
    });
    this.hubConnection.onclose(() => {
      this.isConnected.set(false);
      this.joinedSignalRGroup = null;
    });
  }

  private _flushPendingRoomJoin(): void {
    if (!this.pendingRoomId) return;
    const id = String(this.pendingRoomId);
    this.pendingRoomId = null;
    void this._joinSignalRGroupForCheckup(id).catch(err =>
      this._logHubError('JoinGroup (after connect)', err)
    );
  }

  private _signalRGroupName(checkupId: string): string {
    return `chat_${checkupId}`;
  }

  private _joinSignalRGroupForCheckup(checkupId: string): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !this.hubConnection) {
      return Promise.resolve();
    }
    if (this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      this.pendingRoomId = checkupId;
      return Promise.resolve();
    }

    const next = this._signalRGroupName(checkupId);
    if (this.joinedSignalRGroup === next) {
      return Promise.resolve();
    }

    const hub = this.hubConnection;
    const leaveFirst =
      this.joinedSignalRGroup != null
        ? hub.invoke('LeaveGroup', this.joinedSignalRGroup).catch(err => {
            this._logHubError('LeaveGroup (when switching room)', err);
          })
        : Promise.resolve();

    return leaveFirst.then(() =>
      hub.invoke('JoinGroup', next).then(() => {
        this.joinedSignalRGroup = next;
      })
    );
  }

  private _leaveSignalRGroupIfJoined(): Promise<void> {
    if (
      !this.hubConnection ||
      this.hubConnection.state !== signalR.HubConnectionState.Connected ||
      !this.joinedSignalRGroup
    ) {
      this.joinedSignalRGroup = null;
      return Promise.resolve();
    }
    const g = this.joinedSignalRGroup;
    return this.hubConnection
      .invoke('LeaveGroup', g)
      .catch(err => this._logHubError('LeaveGroup (on unsubscribe)', err))
      .then(() => {
        this.joinedSignalRGroup = null;
      });
  }

  private _registerEvents(): void {
    if (!this.hubConnection) return;

    this.hubConnection.on('ReceiveMessage', (data: any) => this._onMessageReceived(data));
    this.hubConnection.on('message.sent', (data: any) => this._onMessageReceived(data));
    this.hubConnection.on('ReceiveDoctorMessage', (data: any) => this._onMessageReceived(data));

    this.hubConnection.on('ReceiveChatMessage', (...args: any[]) => {
      const [a, b] = args;
      if (args.length >= 2 && typeof a === 'string') {
        const checkupId =
          this.currentRoomId != null && this.currentRoomId !== ''
            ? String(this.currentRoomId)
            : '';
        this._onMessageReceived({
          id: `rt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          message: a,
          messageType:
            typeof b === 'string' || typeof b === 'number' ? b : ChatMessageType.Text,
          checkUpId: checkupId,
          isFromDoctor: true
        });
      } else if (a && typeof a === 'object') {
        this._onMessageReceived(a);
      }
    });

  }

  private _onMessageReceived(data: any): void {
    const normalized = this._normalizeMessage(data, data?.checkupId ?? data?.checkUpId);

    this.messages.update(list =>
      list.map(m =>
        m.pending && m.message === (data.message ?? data.body)
          ? { ...normalized, pending: false }
          : m
      )
    );

    const exists = this.messages().some((m: any) => m.id === normalized.id);
    if (!exists) {
      this.messages.update(list => [...list, normalized]);
    }

    this.conversations.update(list => {
      const roomId = data.checkupId ?? data.checkUpId ?? data.room_id ?? data.roomId;
      const index = list.findIndex(
        (c: any) =>
          (c.room_id ?? c.roomId ?? c.checkupId ?? c.checkUpId) === roomId
      );
      if (index === -1) return list;

      const updated = [...list];
      updated[index] = {
        ...updated[index],
        last_message: data.message ?? data.body,
        last_message_created_at: 'الآن',
        unseen_messages_count: data.isFromDoctor
          ? (updated[index].unseen_messages_count ?? 0) + 1
          : updated[index].unseen_messages_count
      };
      return [updated[index], ...updated.filter((_, i) => i !== index)];
    });
  }

  stopConnection(): void {
    const hc = this.hubConnection;
    if (!hc) return;

    const finish = () => {
      hc.stop().catch(err => console.error('[ChatService] Error stopping SignalR:', err));
      this.hubConnection = null;
      this.joinedSignalRGroup = null;
      this.currentRoomId = null;
      this.pendingRoomId = null;
      this.isConnected.set(false);
    };

    if (
      this.joinedSignalRGroup &&
      hc.state === signalR.HubConnectionState.Connected
    ) {
      hc.invoke('LeaveGroup', this.joinedSignalRGroup)
        .catch(err => this._logHubError('LeaveGroup (on stop)', err))
        .finally(() => finish());
    } else {
      finish();
    }
  }

  loadMyConversations(): void {
    this.conversations.set([]);
    this.unseenMessagesCount.set(0);
  }

  /** Hub / API may send numeric enum (1–4) or name — normalize for templates. */
  private _normalizeMessageType(t: unknown): string {
    if (typeof t === 'number') {
      if (t === ChatMessageType.Text) return 'Text';
      if (t === ChatMessageType.SpecialImage) return 'SpecialImage';
      if (t === ChatMessageType.Image) return 'Image';
      if (t === ChatMessageType.File) return 'File';
    }
    const s = String(t ?? 'Text').trim();
    const lower = s.toLowerCase();
    if (lower === '1' || lower === 'text') return 'Text';
    if (lower === '2' || lower === 'specialimage' || lower === 'special_image') return 'SpecialImage';
    if (lower === '3' || lower === 'image') return 'Image';
    if (lower === '4' || lower === 'file' || lower === 'document') return 'File';
    return s;
  }

  /** Value sent on SendMessage DTO (C# enum). */
  private _messageTypeToHubValue(t: unknown): number {
    if (typeof t === 'number' && t >= 1 && t <= 4) return t;
    const s = String(t ?? '').toLowerCase();
    if (s === '1' || s === 'text') return ChatMessageType.Text;
    if (s === '2' || s === 'specialimage' || s === 'special_image') return ChatMessageType.SpecialImage;
    if (s === '3' || s === 'image') return ChatMessageType.Image;
    if (s === '4' || s === 'file' || s === 'document') return ChatMessageType.File;
    return ChatMessageType.Text;
  }

  private _normalizeMessage(m: any, checkupId?: string | number): any {
    if (!m) return null;
    const cid = m.checkupId ?? m.checkUpId ?? checkupId;
    return {
      id: String(m.id ?? m),
      message: m.message ?? m.body ?? '',
      isFromDoctor: Boolean(m.isFromDoctor),
      messageType: this._normalizeMessageType(m.messageType),
      checkupId: String(cid ?? ''),
      pending: m.pending,
      failed: m.failed
    };
  }

  private _absoluteMediaUrl(path: string): string {
    const p = path?.trim() ?? '';
    if (!p) return '';
    if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('blob:')) return p;
    const base = Environment.apiUrl.replace(/\/$/, '');
    return `${base}/${p.replace(/^\//, '')}`;
  }

  private _mediaUrlFromUploadResponse(res: any): string {
    const d = res?.data ?? res;
    const url =
      d?.url ??
      d?.fileUrl ??
      d?.mediaUrl ??
      d?.path ??
      d?.filePath ??
      d?.raw ??
      (typeof d === 'string' ? d : '');
    return String(url ?? '').trim();
  }

  loadRoomMessages(
    checkupId: string,
    paging?: { from?: string | number; count?: number }
  ): void {
    this.currentRoomId = checkupId;

    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.pendingRoomId = null;
      void this._joinSignalRGroupForCheckup(checkupId).catch(err =>
        this._logHubError('JoinGroup', err)
      );
    } else {
      this.pendingRoomId = checkupId;
    }

    this._loadRoomMessagesHttp(checkupId, paging);
  }

  private _loadRoomMessagesHttp(
    checkupId: string,
    paging?: { from?: string | number; count?: number }
  ): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.messages.set([]);
      return;
    }
    this.getChatMessages(checkupId, paging).subscribe({
      next: (res: any) => {
        const raw = Array.isArray(res) ? res : (res?.data ?? res?.messages ?? []);
        const list = Array.isArray(raw) ? raw : [];
        const messages = list
          .map((m: any) => this._normalizeMessage(m, checkupId))
          .filter(Boolean);

        this.messages.set(messages);

        const room = res?.data?.room ?? res?.room;
        const members = res?.data?.members ?? res?.members ?? [];
        this.roomDetails.set({ room, members });
      },
      error: () => this.messages.set([])
    });
  }

  sendMessage(
    checkupId: string | number,
    message: string,
    options: { isDoctor?: boolean; messageType?: string | number } = {}
  ): void {
    const messageTypeHub = this._messageTypeToHubValue(options.messageType ?? ChatMessageType.Text);
    const messageType = this._normalizeMessageType(messageTypeHub);
    const tempId = 'temp-' + Date.now();
    const localMessage = this._normalizeMessage({
      id: tempId,
      message,
      isFromDoctor: options.isDoctor ?? false,
      messageType,
      checkUpId: String(checkupId),
      pending: true
    }, checkupId);

    this.messages.update(list => [...list, localMessage]);

    const markFailed = () =>
      this.messages.update(list =>
        list.map((m: any) =>
          m.id === tempId ? { ...m, failed: true, pending: false } : m
        )
      );

    const markSent = () =>
      this.messages.update(list =>
        list.map((m: any) =>
          m.id === tempId ? { ...m, pending: false } : m
        )
      );

    if (
      !this.hubConnection ||
      this.hubConnection.state !== signalR.HubConnectionState.Connected
    ) {
      console.warn('[ChatService] Cannot send — SignalR not connected');
      markFailed();
      return;
    }

    const dto = {
      checkUpId: String(checkupId),
      message,
      messageType: messageTypeHub,
      isFromDoctor: options.isDoctor ?? false
    };

    this.hubConnection
      .invoke('SendMessage', dto)
      .then(() => markSent())
      .catch(err => {
        this._logHubError('SendMessage', err);
        markFailed();
      });
  }

  uploadFileAndSend(checkupId: string, file: File, options: { isDoctor?: boolean } = {}): void {
    if (!isPlatformBrowser(this.platformId) || !checkupId) return;

    const isDoctor = options.isDoctor ?? false;
    const isImage = file.type.startsWith('image/');
    const messageTypeHub = isImage ? ChatMessageType.Image : ChatMessageType.File;
    const messageType = this._normalizeMessageType(messageTypeHub);
    const tempId = 'temp-upload-' + Date.now();
    let previewUrl = '';
    if (isImage) {
      previewUrl = URL.createObjectURL(file);
    }

    const localMessage = this._normalizeMessage(
      {
        id: tempId,
        message: isImage ? previewUrl : `📎 ${file.name}`,
        isFromDoctor: isDoctor,
        messageType,
        checkUpId: String(checkupId),
        pending: true
      },
      checkupId
    );
    this.messages.update(list => [...list, localMessage]);

    const markUploadFailed = () =>
      this.messages.update(list =>
        list.map((m: any) =>
          m.id === tempId ? { ...m, failed: true, pending: false } : m
        )
      );

    this.uploadChatMedia(checkupId, file, { isDoctor }).subscribe({
      next: res => {
        let url = this._mediaUrlFromUploadResponse(res);
        url = this._absoluteMediaUrl(url);
        if (!url) {
          console.error('[ChatService] upload-media response had no URL', res);
          markUploadFailed();
          return;
        }
        if (previewUrl) {
          try {
            URL.revokeObjectURL(previewUrl);
          } catch {
            /* ignore */
          }
        }
        this.messages.update(list => list.filter((m: any) => m.id !== tempId));
        this.sendMessage(checkupId, url, { isDoctor, messageType: messageTypeHub });
      },
      error: (err: HttpErrorResponse) => {
        const classified = classifyChatMediaUploadHttpError(err);
        console.error(
          '[ChatService] upload-media failed (HTTP, not SignalR):',
          classified.kind,
          classified.message,
          err
        );
        if (previewUrl) {
          try {
            URL.revokeObjectURL(previewUrl);
          } catch {
            /* ignore */
          }
        }
        markUploadFailed();
      }
    });
  }

  subscribe(roomId: string | number): void {
    this.currentRoomId = String(roomId);
  }

  unsubscribe(_roomId?: string | number): void {
    void this._leaveSignalRGroupIfJoined();
    this.currentRoomId = null;
  }

  ngOnDestroy(): void {
    this.stopConnection();
  }
}
