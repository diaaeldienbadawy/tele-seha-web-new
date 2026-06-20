import {
  AfterViewChecked,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ChatService } from '../../service/chat.service';
import { LocalstorageService } from '../../../../core/services/localstorage.service';

@Component({
  selector: 'app-patient-chat-video-call',
  imports: [],
  templateUrl: './patient-chat-video-call.component.html',
  styleUrl: './patient-chat-video-call.component.css',
})
export class PatientChatVideoCallComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLElement>;
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  private chatService = inject(ChatService);
  private localStorageService = inject(LocalstorageService);
  messages = this.chatService.messages;
  checkUpId = '';

  private _lastMessageCount = 0;

  ngOnInit(): void {
    const raw = localStorage.getItem('agoraDetails') || localStorage.getItem('agoraDetailsPatient') || '{}';
    const stored = JSON.parse(raw);
    const checkUpId = stored?.checkUpId;
    if (!checkUpId) {
      console.error('No checkUpId found in agoraDetails / agoraDetailsPatient');
      return;
    }

    this.checkUpId = String(checkUpId);
    const userId = this.localStorageService.get('patientId');
    if (userId) {
      this.chatService.startConnection(userId);
    }
    this.chatService.loadRoomMessages(this.checkUpId);
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
