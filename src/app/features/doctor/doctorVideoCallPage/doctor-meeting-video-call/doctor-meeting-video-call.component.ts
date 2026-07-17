import { doctor } from './../../doctor.routes';
import {
  Component,
  computed,
  EventEmitter,
  inject,
  OnDestroy,
  Output,
  signal,
} from '@angular/core';
import { AgoraService } from '../../service/agora.service';
import { DoctorsService } from '../../../../shared/services/doctors.service';
import { LocalstorageService } from '../../../../core/services/localstorage.service';

const CALL_DURATION_SEC = 15 * 60;

@Component({
  selector: 'app-doctor-meeting-video-call',
  imports: [],
  templateUrl: './doctor-meeting-video-call.component.html',
  styleUrl: './doctor-meeting-video-call.component.css',
})
export class DoctorMeetingVideoCallComponent implements OnDestroy {
  @Output() openWhatsapp = new EventEmitter<void>();
  private agoraService: AgoraService = inject(AgoraService);
  private localStorageService: LocalstorageService =
    inject(LocalstorageService);
  private doctorService: DoctorsService = inject(DoctorsService);
  localTracks: any[] | null = null;
  micMuted = false;
  cameraOff = false;
  details: any = null;
  userId: string | number = 0;
  showWaitingForOtherParticipant = signal<boolean>(true);

  meetingId!: number;
  agoraDetails = signal<any>(null);

  private readonly callRemainingSeconds = signal<number | null>(null);
  private callTimerId: ReturnType<typeof setInterval> | null = null;

  readonly callTimerLabel = computed(() => {
    const s = this.callRemainingSeconds();
    if (s === null) {
      return '';
    }
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `[${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}]`;
  });

  medicalHistory: any[] = [];

  ngOnInit() {
    this.medicalHistory = this.parseStored(
      this.localStorageService.get('medicalHistory'),
    ) ?? [];

    console.log(this.medicalHistory);
    const stored: any = this.parseStored(
      this.localStorageService.get('agoraDetails'),
    );

    this.meetingId = Number(this.localStorageService.get('meetingId'));
    this.userId = this.localStorageService.userId() ?? 0;

    const meetingId = stored?.checkUpId;
    this.details = stored;
    console.log(this.details);
    if (meetingId) {
      this.agoraService
        .generateToken(meetingId, this.userId)
        .subscribe((res: any) => {
          this.agoraDetails.set(res);
          console.log(this.agoraDetails());
          this.openAgoraVideo();
        });
    }

    if (!meetingId) {
      console.error('No meeting id found in agoraDetails');
      return;
    }
    if (this.details?.providerToken) {
      // this.openAgoraVideo();
    }
  }

  /** بيقرأ JSON بأمان من غير ما يرمي exception لو القيمة فاضية/غلط. */
  private parseStored(raw: string | null): any {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  openWhatsApp() {
    this.openWhatsapp.emit();
  }

  showPopupReports: boolean = false;

  openModal() {
    this.showPopupReports = true;
  }

  openAgoraVideo() {
    setTimeout(() => {
      this.startCall().catch((err) => {
        console.error('Agora start call failed', err);
        this.endCall();
      });
    }, 100);
  }

  async startCall() {
    const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
    console.log(this.details);

    const channel = this.agoraDetails().channel;
    const token = this.agoraDetails().token;
    const uid = this.agoraDetails().uid;

    // لازم نسجّل الـ listeners قبل الـ join عشان منفوتش الطرف
    // اللي يكون ناشر الفيديو/الصوت قبل ما ندخل القناة.
    const client = await this.agoraService.ensureClient();
    client.removeAllListeners('user-published');
    client.removeAllListeners('user-unpublished');
    client.removeAllListeners('user-left');

    client.on('user-published', async (user: any, mediaType: any) => {
      await client.subscribe(user, mediaType);
      if (mediaType === 'video') {
        user.videoTrack?.play('remote-video');
        this.showWaitingForOtherParticipant.set(false);
      }
      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }
    });

    client.on('user-unpublished', (_user: any, mediaType: any) => {
      if (mediaType === 'video') {
        this.showWaitingForOtherParticipant.set(true);
      }
    });

    client.on('user-left', () => {
      this.showWaitingForOtherParticipant.set(true);
    });

    await this.agoraService.joinChannel(channel, token, uid);

    try {
      this.localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();
      await this.agoraService.client.publish(this.localTracks as any);
      this.localTracks[1].play('local-video');
    } catch (cameraErr: any) {
      console.warn(
        'Camera unavailable, continuing with audio only:',
        cameraErr?.message ?? cameraErr,
      );
      this.cameraOff = true;
      try {
        const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
        this.localTracks = [micTrack];
        await this.agoraService.client.publish([micTrack] as any);
      } catch (micErr) {
        console.error('Microphone also unavailable:', micErr);
        throw micErr;
      }
    }

    this.startCallTimer(this.details?.start || this.details?.Start);
  }
  /** Call length in seconds: the session's configured duration (minutes), or 15-min fallback. */
  private callDurationSec(): number {
    const minutes = Number(this.details?.duration);
    return Number.isFinite(minutes) && minutes > 0 ? minutes * 60 : CALL_DURATION_SEC;
  }

  private startCallTimer(startDateString?: string): void {
    this.resetCallTimer();
    const durationSec = this.callDurationSec();

    const updateTimer = () => {
      let remaining = durationSec;
      if (startDateString) {
        const startTime = new Date(startDateString).getTime();
        const now = new Date().getTime();
        const elapsed = Math.floor((now - startTime) / 1000);
        remaining = durationSec - elapsed;
      }
      
      if (remaining <= 0) {
        this.callRemainingSeconds.set(0);
        this.clearCallTimerInterval();
        this.endCall();
      } else {
        this.callRemainingSeconds.set(remaining);
      }
    };

    updateTimer();
    this.callTimerId = setInterval(updateTimer, 1000);
  }

  private clearCallTimerInterval(): void {
    if (this.callTimerId !== null) {
      clearInterval(this.callTimerId);
      this.callTimerId = null;
    }
  }

  /** Stop ticking and hide timer (when leaving the call) */
  private resetCallTimer(): void {
    this.clearCallTimerInterval();
    this.callRemainingSeconds.set(null);
  }

  /** Release local tracks + leave the Agora channel WITHOUT finalizing the meeting. */
  private async leaveCall() {
    this.resetCallTimer();
    if (this.localTracks) {
      this.localTracks.forEach((track: any) => {
        track.stop();
        track.close();
      });
      this.localTracks = null;
    }
    await this.agoraService.leaveChannel();
    this.micMuted = false;
    this.cameraOff = false;
  }

  /** Explicit end (End-call button / auto-timeout): leave the channel AND close the meeting. */
  async endCall() {
    await this.leaveCall();
    this.closeMeeting();
  }

  closeMeeting() {
    this.doctorService.closeMeeting(this.meetingId).subscribe({
      next: (res) => {
        console.log("res");
        console.log(res);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  async toggleMic() {
    if (this.localTracks?.[0]) {
      this.micMuted = !this.micMuted;
      await this.localTracks[0].setMuted(this.micMuted);
    }
  }

  async toggleCamera() {
    if (this.localTracks?.[1]) {
      this.cameraOff = !this.cameraOff;
      await this.localTracks[1].setMuted(this.cameraOff);
    }
  }

  ngOnDestroy(): void {
    // Only release local call resources on teardown. Closing the meeting must stay an explicit
    // doctor action (End-call button or the auto-timeout) — otherwise an accidental navigation
    // or a page refresh would finalize the consultation and its check-up unintentionally.
    this.resetCallTimer();
    void this.leaveCall();
  }
}
