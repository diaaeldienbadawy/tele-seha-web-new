import {
  AfterViewChecked,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ChatService } from '../../../patient/service/chat.service';
import { LocalstorageService } from '../../../../core/services/localstorage.service';

@Component({
  selector: 'app-doctor-chat-video-call',
  imports: [],
  templateUrl: './doctor-chat-video-call.component.html',
  styleUrl: './doctor-chat-video-call.component.css',
})
export class DoctorChatVideoCallComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLElement>;
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  private chatService = inject(ChatService);
  private localStorageService = inject(LocalstorageService);
  messages = this.chatService.messages;
  checkUpId = '';

  private _lastMessageCount = 0;

  ngOnInit(): void {
    // let checkUpId = this.localStorageService.get('checkUpId');
    let checkUpId = JSON.parse(localStorage.getItem('agoraDetails') || '{}')?.checkUpId;
    console.log('checkUpId', checkUpId);

    if (!checkUpId) {
      const raw = localStorage.getItem('agoraDetails') || '{}';
      const stored = JSON.parse(raw);
      checkUpId = stored?.checkUpId;
    }
    if (!checkUpId) {
      console.error('No checkUpId found for doctor chat');
      return;
    }

    this.checkUpId = String(checkUpId);
    const userId = this.localStorageService.get('doctorId');
    if (userId) {
      this.chatService.startConnection(userId);
    }
    this.chatService.loadRoomMessages(this.checkUpId);
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
