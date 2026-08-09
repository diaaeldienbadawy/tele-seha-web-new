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
import { ChatService } from '../../service/chat.service';
import { LocalstorageService } from '../../../../core/services/localstorage.service';

@Component({
  selector: 'app-patient-chat-video-call',
  imports: [CommonModule],
  templateUrl: './patient-chat-video-call.component.html',
  styleUrl: './patient-chat-video-call.component.css',
})
export class PatientChatVideoCallComponent
  implements OnInit, OnChanges, AfterViewChecked, OnDestroy
{
  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLElement>;
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  /**
   * معرّف الكشف من الصفحة الأب (الراوت `videoCall/:sessionId` هو أصلًا checkUp.id،
   * ونفس القيمة بترجع من `meetingReport.checkUpId`). كان بيتقرا من localStorage
   * وبيبص على مفتاح الطبيب `agoraDetails` الأول — مصدر غلط في متصفح شغّال عليه
   * الحسابين، وفاضي في مسارات دخول تانية، فالشات كان بيقع من غير غرفة.
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
      console.error('[PatientChat] No checkUpId available for this meeting');
      return;
    }
    if (checkUpId === this.checkUpId) return;

    this.checkUpId = checkUpId;
    this.chatService.startConnection(this.localStorageService.get('patientId'));
    this.chatService.loadRoomMessages(this.checkUpId);
  }

  private resolveCheckUpId(): string {
    if (this.checkUpIdInput != null && String(this.checkUpIdInput).trim() !== '') {
      return String(this.checkUpIdInput);
    }

    // مفتاح المريض قبل مفتاح الطبيب — العكس كان بيقرأ غرفة الطبيب.
    const stored =
      this.parseStored(localStorage.getItem('agoraDetailsPatient')) ??
      this.parseStored(localStorage.getItem('agoraDetails'));
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

  onSend(inputEl: HTMLInputElement): void {
    const value = inputEl?.value?.trim();
    if (!value || !this.checkUpId) return;
    this.chatService.sendMessage(this.checkUpId, value, { isDoctor: false });
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
    this.chatService.uploadFileAndSend(this.checkUpId, file, { isDoctor: false });
  }

  ngOnDestroy(): void {
    this.chatService.unsubscribe();
  }

  ngAfterViewChecked(): void {
    const count = this.messages().length;
    if (count !== this._lastMessageCount) {
      this._lastMessageCount = count;
      this.scrollToBottom();
    }
  }

  scrollToBottom(): void {
    try {
      if (this.chatContainer?.nativeElement) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (_err) {}
  }
}
