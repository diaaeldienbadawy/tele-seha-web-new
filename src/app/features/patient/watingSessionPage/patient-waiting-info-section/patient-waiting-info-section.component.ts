import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientAuthService } from '../../service/patient-auth.service';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { NotificationService } from '../../service/notification.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-patient-waiting-info-section',
  imports: [TranslateModule],
  templateUrl: './patient-waiting-info-section.component.html',
  styleUrl: './patient-waiting-info-section.component.css',
})
export class PatientWaitingInfoSectionComponent implements OnInit {
  session: any;
  sessionId: string | null = null;
  item: any;

  /** Populated once the doctor starts THIS patient's meeting (via realtime). */
  startedData: any = null;
  patientId: string | null = null;

  private destroyRef = inject(DestroyRef);

  constructor(
    readonly route: ActivatedRoute,
    readonly patientService: PatientAuthService,
    readonly router: Router,
    readonly localStorageService: LocalstorageService,
    private notificationService: NotificationService,
  ) {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId') || null;
  }

  ngOnInit(): void {
    const sessionStateRaw = this.localStorageService.get('sessionState');
    try {
      this.item = sessionStateRaw ? JSON.parse(sessionStateRaw) : null;
    } catch {
      this.item = null;
    }

    this.getSession();

    // Real-time queue/turn updates come through the notification hub as
    // AppointmentEvent / SessionEvent. On any of them we re-fetch this session so
    // the displayed turn stays current. (The old SignalRService was a dead stub
    // pointing at a placeholder URL and listening for events the backend never sends.)
    this.patientId = this.localStorageService.loggedInPatientId();
    if (this.patientId) {
      this.notificationService.startPatientConnection(this.patientId);
    }

    this.notificationService.appointmentEvents$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((evt: any) => this.handleRealtimeEvent(evt));
  }

  private handleRealtimeEvent(evt: any): void {
    // Any appointment/session event refreshes the displayed turn.
    this.getSession();

    // When the doctor opens THIS patient's appointment the backend pushes
    // `appointment_meeting_started` (only to this patient). That is the real
    // "your turn just started" signal, so capture the ongoing meeting and jump
    // straight into the call instead of leaving the patient stuck on this page.
    const event = evt?.event;
    const data = evt?.data;
    if (event !== 'appointment_meeting_started' || !data) return;

    const eventSessionId = data.sessionId ?? data.session?.id;
    if (
      this.sessionId &&
      eventSessionId != null &&
      String(eventSessionId) !== String(this.sessionId)
    ) {
      return; // a different session of the same patient
    }

    this.startedData = data;
    this.joinCall();
  }

  /** Enabled once the meeting has started (button click or auto-navigation). */
  joinCall(): void {
    const data = this.startedData;
    const meetings: any[] = data?.checkUp?.meetings ?? [];
    const meeting =
      meetings.find((m) => m?.status === 'Ongoing') ??
      meetings[meetings.length - 1];
    const checkUpId = data?.checkUp?.id;
    if (!meeting || checkUpId == null) return;

    const videoCallData = {
      channelName: meeting.channelName,
      consumerToken: meeting.consumerToken,
      patientId: this.patientId,
    };
    this.localStorageService.set(
      'patientVideoCall',
      JSON.stringify(videoCallData),
    );
    localStorage.setItem('meetingId', String(meeting.id));
    localStorage.setItem('channelName', meeting.channelName);
    localStorage.setItem('token', meeting.consumerToken);
    // The doctor card lives on the SESSION, not on each appointment — reading it off the
    // appointment stored '' and the rating form ended up sending doctor_id = 0.
    localStorage.setItem(
      'doctorIdOnMeeting',
      String(
        this.session?.doctorCard?.doctorId ??
          data?.doctorCard?.doctorId ??
          this.item?.doctorCard?.doctorId ??
          '',
      ),
    );
    localStorage.setItem('patientId', this.patientId ?? '');
    localStorage.setItem('agoraDetailsPatient', JSON.stringify(meeting));
    this.router.navigate(['/patient/videoCall/' + checkUpId]);
  }

  getSession() {
    if (!this.sessionId) return;
    this.patientService.waitingSession(Number(this.sessionId)).subscribe({
      next: (res) => {
        this.session = res;

        // Recover from a missed realtime event: if our appointment is already Started with an
        // ongoing meeting, populate startedData so the (already-rendered) "join" button enables
        // and the patient can enter the call manually instead of being stuck waiting.
        const myStarted = (res?.appointments ?? []).find(
          (a: any) => a?.status === 'Started',
        );
        const hasOngoing = (myStarted?.checkUp?.meetings ?? []).some(
          (m: any) => m?.status === 'Ongoing',
        );
        if (myStarted && hasOngoing && !this.startedData) {
          this.startedData = myStarted;
        }
      },
      error: (err) => {
        console.error('[WaitingSession] Failed to load session:', err);
      },
    });
  }
}
