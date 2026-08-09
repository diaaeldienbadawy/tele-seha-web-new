import { patinet } from './../../patient.routes';
import { Component, DestroyRef, Inject, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorsService } from '../../../../shared/services/doctors.service';
import { BookingSessionService } from '../../../../shared/services/booking-session.service';
import { RecentAppointmentsService } from '../../../../shared/services/recent-appointments.service';
import { PatientChatAiForEnterSessionService } from '../../../../shared/services/patient-chat-ai-for-enter-session.service';
import { SessionStateService } from '../../../../shared/services/session-state.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { PatientAppointmentStatus } from '../../../../core/enum/patientAppointmentStatus';
import { NotificationService } from '../../../patient/service/notification.service';

@Component({
  selector: 'app-doctor-details-section',
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './doctor-details-section.component.html',
  styleUrl: './doctor-details-section.component.css',
})
export class DoctorDetailsSectionComponent implements OnInit {
  showPopup: boolean = false;
  isBrowser = false;
  doctorId: number | null = null;
  patinetId!: number;

  sessions: any[] = [];
  uniqueDays: any[] = [];

  selectedDate: string | null = null;
  selectedSessionId: number | null = null;

  // ================== Post-Booking Flow ==================
  bookingCompleted: boolean = false;
  activeBooking: any = null;
  bookingLoading: boolean = false;

  // Chat AI popup (post-booking)
  showPostBookingChatAI: boolean = false;
  selectedAppointmentId: number | null = null;

  // Chat AI Logic
  complaintStarted = false;
  complaintId: string | null = null;
  loading = false;
  firstComplaintText = '';
  aiQuestion: any = null;
  textAnswer = '';
  yesOrNoAnswer: boolean | null = null;
  selectedChoices: string[] = [];

  private destroyRef = inject(DestroyRef);

  constructor(
    readonly route: ActivatedRoute,
    readonly router: Router,
    readonly doctorService: DoctorsService,
    readonly bookingSessionService: BookingSessionService,
    readonly recentAppointmentService: RecentAppointmentsService,
    readonly patientChatAi: PatientChatAiForEnterSessionService,
    readonly sessionState: SessionStateService,
    readonly toastr: ToastrService,
    readonly localStorageService: LocalstorageService,
    readonly notificationService: NotificationService,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.doctorId = Number(this.route.snapshot.paramMap.get('doctorId'));
    this.patinetId = Number(this.localStorageService.get('patientId'));
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    console.log('doctorId:', this.doctorId);

    this.loadDoctorDetails();

    // Listen for real-time appointment status changes (SignalR)
    if (this.isBrowser && this.patinetId) {
      this.notificationService.startPatientConnection(String(this.patinetId));

      this.notificationService.appointmentEvents$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          if (this.bookingCompleted && this.activeBooking) {
            this.refreshBookingStatus();
          }
        });
    }
  }

  groupedSchedules: {
    day: string;
    times: { startTime: string; endTime: string }[];
  }[] = [];

  data: any;
  loadDoctorDetails() {
    if (this.doctorId) {
      this.doctorService.getDoctorProfile(this.doctorId).subscribe({
        next: (res) => {
          console.log(res);
          this.data = res.data;
          const schedules = this.data?.schedules || [];
          const map = new Map<
            string,
            { startTime: string; endTime: string }[]
          >();

          schedules.forEach((item: any) => {
            if (!map.has(item.day)) {
              map.set(item.day, []);
            }
            map
              .get(item.day)
              ?.push({ startTime: item.startTime, endTime: item.endTime });
          });

          this.groupedSchedules = Array.from(map, ([day, times]) => ({
            day,
            times,
          }));
        },
        error: (err) => console.log(err),
      });
    }
  }

  showModal() {
    this.showPopup = true;
    // Reset post-booking state when re-opening modal
    this.bookingCompleted = false;
    this.activeBooking = null;

    if (!this.doctorId) return;
    this.sessions = [];
    this.uniqueDays = [];
    this.doctorService.getSessions(this.doctorId).subscribe({
      next: (res: any[]) => {
        this.sessions = res;

        // 👇 أيام بدون تكرار
        this.uniqueDays = Array.from(
          new Map(res.map((s) => [s.date, s])).values(),
        );

        // 👇 اختيار أول يوم تلقائي
        if (this.uniqueDays.length) {
          this.selectDay(this.uniqueDays[0].date);
        }
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
        this.sessions = [];
        this.uniqueDays = [];
      },
    });
  }

  selectDay(date: string) {
    this.selectedDate = date;
    this.selectedSessionId = null;
  }

  selectSession(sessionId: number) {
    this.selectedSessionId = sessionId;
    console.log('SESSION ID =>', sessionId);
  }

  getSessionsByDate() {
    return this.sessions.filter((s) => s.date === this.selectedDate);
  }

  getDayName(date: string): string {
    const lang = this.localStorageService.get('lang') || 'en';
    return new Date(date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long' });
  }

  getDayWithMonth(date: string): string {
    const lang = this.localStorageService.get('lang') || 'en';
    return new Date(date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      day: '2-digit',
      month: 'short',
    });
  }

  formatTime(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  bookingSession() {
    console.log(this.patinetId, this.selectedSessionId);

    if (!this.patinetId || !this.selectedSessionId) return;
    this.bookingSessionService
      .bookingSession(this.patinetId, this.selectedSessionId)
      .subscribe({
        next: (res: any) => {
          console.log('Booking response:', res);
          this.toastr.success(res.message || 'Session Booked Successfully');

          // The API now returns AppointmentDto { id, status, session, doctorCard, sessionId }.
          // Use it directly, with local fallbacks for anything missing.
          const selectedSession = this.sessions.find(
            (s) => s.sessionId === this.selectedSessionId,
          );

          this.activeBooking = {
            id: res?.id ?? null,
            status: res?.status ?? PatientAppointmentStatus.Created,
            session: res?.session ?? selectedSession,
            sessionId: res?.sessionId ?? selectedSession?.sessionId ?? this.selectedSessionId,
            doctorCard: res?.doctorCard ?? this.data,
          };
          this.bookingCompleted = true;
        },
        error: (err) => {
          const apiError = err?.error;

          if (apiError?.message) {
            this.toastr.error(apiError.message);
            return;
          }

          if (apiError?.errors) {
            Object.entries(apiError.errors).forEach(
              ([key, messages]: [string, any]) => {
                messages.forEach((msg: string) => {
                  this.toastr.error(`${key} : ${msg}`);
                });
              },
            );
          }
        },
      });
  }

  // ================== Post-Booking Status Methods ==================

  /**
   * Tries to enrich the activeBooking with full data from the API.
   * This is a best-effort background call — if it fails or returns nothing,
   * the modal stays open with the locally-constructed activeBooking.
   */
  private tryEnrichBookingFromApi(knownId: number | null) {
    if (!this.patinetId) return;
    this.recentAppointmentService.appointmentComming(this.patinetId).subscribe({
      next: (res: any[]) => {
        if (!Array.isArray(res) || res.length === 0) return;

        let match: any = null;

        // If we have the ID, find by ID.
        if (knownId) {
          match = res.find((a: any) => a.id === knownId);
        }

        // Otherwise pick the most recent appointment for this doctor/session.
        if (!match) {
          match = res.find(
            (a: any) =>
              a.session?.sessionId === this.selectedSessionId ||
              a.doctorCard?.doctorId === this.doctorId,
          );
        }

        // Last resort: just take the first one.
        if (!match) {
          match = res[0];
        }

        if (match) {
          // Preserve the session we already stored if the API item lacks it.
          if (!match.session && this.activeBooking?.session) {
            match.session = this.activeBooking.session;
          }
          this.activeBooking = match;
        }
      },
      error: () => {
        // Silently ignore — we already have a working activeBooking.
      },
    });
  }

  /**
   * Refreshes the booking status from the API using the appointment list.
   */
  refreshBookingStatus() {
    if (!this.patinetId || !this.activeBooking) return;
    this.recentAppointmentService.appointmentComming(this.patinetId).subscribe({
      next: (res: any[]) => {
        if (Array.isArray(res)) {
          const found = res.find((a: any) => a.id === this.activeBooking.id);
          if (found) {
            this.activeBooking = found;
          }
        }
      },
    });
  }

  getPostBookingButtonText(): string {
    if (!this.activeBooking) return '';
    return this.getButtonText(this.activeBooking.status);
  }

  getPostBookingButtonColor(): string {
    if (!this.activeBooking) return '';
    return this.getButtonColor(this.activeBooking.status);
  }

  isPostBookingDisabled(): boolean {
    if (!this.activeBooking) return true;
    return this.isButtonDisabled(this.activeBooking.status);
  }

  getButtonText(status: PatientAppointmentStatus | string): string {
    switch (status) {
      case PatientAppointmentStatus.Created:
        return 'appointmentStatus.waitForConfirmation';
      case PatientAppointmentStatus.Confirmed:
        return 'appointmentStatus.paying';
      case PatientAppointmentStatus.CreateComplaint:
        return 'appointmentStatus.chatAi';
      case PatientAppointmentStatus.Pending:
        return 'appointmentStatus.pending';
      case PatientAppointmentStatus.Started:
        return 'appointmentStatus.goToSession';
      case PatientAppointmentStatus.Completed:
        return 'appointmentStatus.completed';
      case PatientAppointmentStatus.Canceled:
        return 'appointmentStatus.canceled';
      default:
        return 'appointmentStatus.waitForConfirmation';
    }
  }

  getButtonColor(status: PatientAppointmentStatus | string): string {
    switch (status) {
      case PatientAppointmentStatus.Created:
        return 'bg-slate-300 text-slate-500 border-transparent cursor-not-allowed';
      case PatientAppointmentStatus.Pending:
        return 'bg-sky-500 text-white border-transparent hover:bg-sky-600 hover:-translate-y-0.5 active:translate-y-0 shadow-md shadow-sky-500/10 hover:shadow-lg transition-all duration-300';
      case PatientAppointmentStatus.Confirmed:
      case PatientAppointmentStatus.Started:
        return 'bg-emerald-500 text-white border-transparent hover:bg-emerald-600 hover:-translate-y-0.5 active:translate-y-0 shadow-md shadow-emerald-500/10 hover:shadow-lg transition-all duration-300';
      case PatientAppointmentStatus.CreateComplaint:
        return 'bg-amber-500 text-white border-transparent hover:bg-amber-600 hover:-translate-y-0.5 active:translate-y-0 shadow-md shadow-amber-500/10 hover:shadow-lg transition-all duration-300';
      case PatientAppointmentStatus.Completed:
        return 'bg-blue-500 text-white border-transparent hover:bg-blue-600 hover:-translate-y-0.5 active:translate-y-0 shadow-md shadow-blue-500/10 hover:shadow-lg transition-all duration-300';
      case PatientAppointmentStatus.Canceled:
        return 'bg-rose-500 text-white border-transparent hover:bg-rose-600 hover:-translate-y-0.5 active:translate-y-0 shadow-md shadow-rose-500/10 hover:shadow-lg transition-all duration-300';
      default:
        return 'bg-(--primary-color) text-white border-transparent';
    }
  }

  isButtonDisabled(status: PatientAppointmentStatus | string): boolean {
    return (
      status === PatientAppointmentStatus.Created ||
      status === PatientAppointmentStatus.Completed ||
      status === PatientAppointmentStatus.Canceled
    );
  }

  /**
   * Handles the post-booking action button click — mirrors handleButtonClick
   * from PatientAllResentSectionComponent.
   */
  handlePostBookingAction() {
    if (!this.activeBooking) return;

    switch (this.activeBooking.status) {
      case PatientAppointmentStatus.Confirmed:
        this.bookingLoading = true;
        this.recentAppointmentService.paying(this.activeBooking.id).subscribe({
          next: () => {
            this.bookingLoading = false;
            this.refreshBookingStatus();
          },
          error: (err) => {
            this.bookingLoading = false;
            const apiError = err?.error;
            if (apiError?.message) {
              this.toastr.error(apiError.message);
              return;
            }
            if (apiError?.errors) {
              Object.entries(apiError.errors).forEach(
                ([key, messages]: [string, any]) => {
                  messages.forEach((msg: string) => {
                    this.toastr.error(`${key} : ${msg}`);
                  });
                },
              );
            }
          },
        });
        break;

      case PatientAppointmentStatus.CreateComplaint:
        this.selectedAppointmentId = this.activeBooking.id;
        this.showPostBookingChatAI = true;
        break;

      case PatientAppointmentStatus.Pending:
        this.localStorageService.set('sessionState', JSON.stringify(this.activeBooking));
        this.router.navigate([
          '/patient/allResent',
          this.activeBooking.sessionId,
          'waitingSession',
        ]);
        break;

      case PatientAppointmentStatus.Started:
        this.enterStartedSession(this.activeBooking);
        break;
    }
  }

  /**
   * Close post-booking modal and reset everything.
   */
  closePostBooking() {
    this.showPopup = false;
    this.bookingCompleted = false;
    this.activeBooking = null;
    this.resetChatAI();
  }

  // ================== Chat AI Logic (for post-booking) ==================

  startComplaint() {
    if (!this.firstComplaintText.trim() || !this.selectedAppointmentId) return;
    if (this.loading) return;
    this.loading = true;

    this.patientChatAi
      .startPatientComplaint(
        this.firstComplaintText,
        this.selectedAppointmentId,
      )
      .subscribe({
        next: (res) => {
          this.loading = false;
          if (!res || !res.bodyValue) {
            this.finishComplaint();
            return;
          }
          this.complaintStarted = true;
          this.complaintId = res.patientMedicalComplaintId;
          this.aiQuestion = res.bodyValue;
          this.resetAnswers();
        },
        error: (err) => {
          this.loading = false;
          this.showComplaintError(err);
        },
      });
  }

  private finishComplaint() {
    this.closePostBookingChatAI();
    this.toastr.success('تم إرسال الشكوى بنجاح — الطبيب سيبدأ معك في موعد الجلسة.');
    this.refreshBookingStatus();
  }

  private showComplaintError(err: any) {
    const apiError = err?.error;
    const message =
      apiError?.message ??
      (typeof apiError === 'string' && apiError ? apiError : null);

    if (message === 'مقيد') {
      this.toastr.warning('تم إنهاء المحادثة — برجاء المحاولة مرة أخرى بوصف واضح للشكوى.');
      this.closePostBookingChatAI();
      return;
    }

    if (message?.includes('ابدأ من جديد')) {
      this.toastr.warning(message);
      this.resetChatAI();
      return;
    }

    this.toastr.error(message || 'تعذر التواصل مع المساعد الذكي، حاول مرة أخرى.');
  }

  sendAnswer() {
    if (!this.complaintId || !this.aiQuestion) return;
    if (this.loading) return;
    this.loading = true;

    let answer = '';
    switch (this.aiQuestion.contentType) {
      case 'McqQuestion':
        answer = this.selectedChoices.join(',');
        break;
      case 'yesOrNo':
        answer = String(this.yesOrNoAnswer);
        break;
      case 'question':
        answer = this.textAnswer;
        break;
      default:
        return;
    }

    this.patientChatAi.patientComplaint(answer, this.complaintId).subscribe({
      next: (res) => {
        this.loading = false;
        if (!res || !res.bodyValue) {
          this.finishComplaint();
          return;
        }
        this.aiQuestion = res.bodyValue;
        this.resetAnswers();
      },
      error: (err) => {
        this.loading = false;
        this.showComplaintError(err);
      },
    });
  }

  toggleChoice(choice: string) {
    if (this.selectedChoices.includes(choice)) {
      this.selectedChoices = this.selectedChoices.filter((c) => c !== choice);
    } else {
      this.selectedChoices.push(choice);
    }
  }

  resetAnswers() {
    this.textAnswer = '';
    this.yesOrNoAnswer = null;
    this.selectedChoices = [];
  }

  resetChatAI() {
    this.complaintStarted = false;
    this.complaintId = null;
    this.aiQuestion = null;
    this.firstComplaintText = '';
    this.resetAnswers();
  }

  closePostBookingChatAI() {
    this.showPostBookingChatAI = false;
    this.resetChatAI();
  }

  // ================== Session Entry (for Started status) ==================

  private currentMeeting(session: any): any | null {
    const meetings: any[] = session?.checkUp?.meetings ?? [];
    return (
      meetings.find((m) => m?.status === 'Ongoing') ??
      meetings[meetings.length - 1] ??
      null
    );
  }

  private enterStartedSession(item: any) {
    const meeting = this.currentMeeting(item);
    // No satisfaction-ratio gate from the doctor details page — just go straight in.
    this.goToSession(item);
  }

  private goToSession(session: any) {
    const meeting = this.currentMeeting(session);
    if (!meeting || session.status !== 'Started') return;

    const videoCallData = {
      channelName: meeting.channelName,
      consumerToken: meeting.consumerToken,
      patientId: this.patinetId,
    };

    this.localStorageService.set(
      'patientVideoCall',
      JSON.stringify(videoCallData),
    );

    localStorage.setItem('meetingId', String(meeting.id));
    localStorage.setItem('channelName', meeting.channelName ?? '');
    localStorage.setItem('token', meeting.consumerToken ?? '');
    localStorage.setItem('doctorIdOnMeeting', String(session.doctorCard?.doctorId ?? ''));
    localStorage.setItem('patientId', this.patinetId?.toString() || '');
    localStorage.setItem('agoraDetailsPatient', JSON.stringify(meeting));
    this.router.navigate(['/patient/videoCall/' + session.checkUp.id]);
  }
}
