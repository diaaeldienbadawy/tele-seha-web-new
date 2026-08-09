import {
  AfterViewChecked,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../patient/service/chat.service';
import { LocalstorageService } from '../../../../core/services/localstorage.service';

@Component({
  selector: 'app-doctor-chat-video-call',
  imports: [CommonModule],
  templateUrl: './doctor-chat-video-call.component.html',
  styleUrl: './doctor-chat-video-call.component.css',
})
export class DoctorChatVideoCallComponent
  implements OnInit, OnChanges, AfterViewChecked, OnDestroy
{
  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLElement>;
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  /**
   * معرّف الكشف الجاي من السيرفر (`meetingReport.checkUpId`) — دا المصدر الموثوق.
   * قبل كده الشات كان بيقراه من `agoraDetails` في localStorage بس: أي مسار دخول
   * مكتبش المفتاح (أو كتب نسخة قديمة) كان بيخلي الشات يشتغل على غرفة غلط أو
   * ميشتغلش خالص — وطبعًا الرسايل ماتوصلش.
   */
  @Input() checkUpIdInput?: number | string | null;

  private chatService = inject(ChatService);
  private localStorageService = inject(LocalstorageService);
  messages = this.chatService.messages;
  connectionState = this.chatService.connectionState;
  checkUpId = '';

  private _lastMessageCount = 0;

  ngOnInit(): void {
    this.connect();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['checkUpIdInput'] && !changes['checkUpIdInput'].firstChange) {
      this.connect();
    }
  }

  private connect(): void {
    const checkUpId = this.resolveCheckUpId();
    if (!checkUpId) {
      console.error('[DoctorChat] No checkUpId available for this meeting');
      return;
    }
    if (checkUpId === this.checkUpId) return;

    this.checkUpId = checkUpId;
    // الـ userId مجرد معلومة في الـ query — السيرفر بيتعرف على المستخدم من التوكن،
    // فالاتصال مبقاش متوقف على وجود مفتاح doctorId في الميموري.
    this.chatService.startConnection(this.localStorageService.get('doctorId'));
    this.chatService.loadRoomMessages(this.checkUpId);
  }

  /** الـ Input أولًا، وبعدين مفاتيح الميتينج المخزّنة كـ fallback. */
  private resolveCheckUpId(): string {
    if (this.checkUpIdInput != null && String(this.checkUpIdInput).trim() !== '') {
      return String(this.checkUpIdInput);
    }

    const stored = this.parseStored(localStorage.getItem('agoraDetails'));
    const fromAgora = stored?.checkUpId ?? stored?.checkUp?.id;
    if (fromAgora) return String(fromAgora);

    const raw = localStorage.getItem('checkUpId');
    return raw ? String(raw) : '';
  }

  private parseStored(raw: string | null): any {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  ngAfterViewChecked(): void {
    const count = this.messages().length;
    if (count !== this._lastMessageCount) {
      this._lastMessageCount = count;
      this.scrollToBottom();
    }
  }

  ngOnDestroy(): void {
    this.chatService.unsubscribe();
  }

  onSend(inputEl: HTMLInputElement): void {
    const value = inputEl?.value?.trim();
    if (!value || !this.checkUpId) return;
    this.chatService.sendMessage(this.checkUpId, value, { isDoctor: true });
    inputEl.value = '';
  }

  onAttachClick(): void {
    this.fileInput?.nativeElement?.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || !this.checkUpId) return;
    this.chatService.uploadFileAndSend(this.checkUpId, file, { isDoctor: true });
  }

  scrollToBottom(): void {
    try {
      if (this.chatContainer?.nativeElement) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (_err) {}
  }
}
