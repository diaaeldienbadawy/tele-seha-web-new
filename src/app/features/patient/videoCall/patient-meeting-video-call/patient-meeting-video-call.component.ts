import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  EventEmitter,
  inject,
  OnDestroy,
  Output,
  signal,
} from '@angular/core';
import { AgoraService } from '../../../doctor/service/agora.service';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { DoctorsService } from '../../../../shared/services/doctors.service';

const CALL_DURATION_SEC = 15 * 60;

@Component({
  selector: 'app-patient-meeting-video-call',
  imports: [CommonModule],
  templateUrl: './patient-meeting-video-call.component.html',
  styleUrl: './patient-meeting-video-call.component.css',
})
export class PatientMeetingVideoCallComponent implements OnDestroy {
  @Output() openWhatsapp = new EventEmitter<void>();
  @Output() sessionEnded = new EventEmitter<void>();
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

  ngOnInit() {
    this.meetingId = Number(this.localStorageService.get('meetingId'));
    const stored: any = JSON.parse(
      this.localStorageService.get('agoraDetailsPatient'),
    );
    this.userId = this.localStorageService.userId() ?? 0;

    const meetingId = stored?.checkUpId;
    if (meetingId) {
      this.agoraService
        .generateToken(meetingId, this.userId)
        .subscribe((res: any) => {
          this.agoraDetails.set(res);
          console.log(this.agoraDetails());
          this.openAgoraVideo();
        });
    }
    this.details = stored;
    console.log(this.details);

    if (!meetingId) {
      console.error('No meeting id found in agoraDetails');
      return;
    }

    if (this.details?.consumerToken) {
      // this.openAgoraVideo();
    }
  }

  openWhatsApp() {
    this.openWhatsapp.emit();
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
    let channel = this.agoraDetails().channel;
    let token = this.agoraDetails().token;
    let uid = this.agoraDetails().uid;

    // channel = 'test';
    // token = '007eJxSYEhfeWlBt0QZo/eM2zcPsdYcZZSRvj/H4Z1hhp80Y+7KlGkKDGkWFmnJRpYWpkbJySbJqQaJacaWqUkWhiaGaYmWZimGt3l3Zzo48TPMmS3MyMjAyMDCwMgA4jOBSWYwyQIlS1KLSxgZTAEBAAD//ydGH9Q=';
    // uid = 5;

    await this.agoraService.joinChannel(channel, token, uid);

    this.agoraService.client.on(
      'user-published',
      async (user: any, mediaType: any) => {
        await this.agoraService.client.subscribe(user, mediaType);
        if (mediaType === 'video') {
          user.videoTrack?.play('remote-video');
          this.showWaitingForOtherParticipant.set(false);
        }
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      },
    );

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

    this.startCallTimer();
  }

  private startCallTimer(): void {
    this.resetCallTimer();
    this.callRemainingSeconds.set(CALL_DURATION_SEC);
    this.callTimerId = setInterval(() => {
      this.callRemainingSeconds.update((prev) => {
        if (prev === null || prev <= 0) {
          return 0;
        }
        return prev - 1;
      });
      const left = this.callRemainingSeconds();
      if (left === 0) {
        this.clearCallTimerInterval();
        this.endCall();
      }
    }, 1000);
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

  async endCall() {
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

    console.log('Session ended');

    this.closeMeeting();
    this.sessionEnded.emit();
  }

  closeMeeting() {
    this.doctorService.closeMeeting(this.meetingId).subscribe({
      next: (res) => {
        console.log('res');
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
    this.resetCallTimer();
    void this.endCall();
  }
}
