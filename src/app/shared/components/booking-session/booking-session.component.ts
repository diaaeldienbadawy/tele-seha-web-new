import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BookingSessionService } from '../../services/booking-session.service';
import { DoctorsService } from '../../services/doctors.service';
import { RecentAppointmentsService } from '../../services/recent-appointments.service';
import { PatientChatAiForEnterSessionService } from '../../services/patient-chat-ai-for-enter-session.service';
import { LocalstorageService } from '../../../core/services/localstorage.service';
import { NotificationService } from '../../../features/patient/service/notification.service';
import { PatientAppointmentStatus } from '../../../core/enum/patientAppointmentStatus';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking-session',
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './booking-session.component.html',
  styleUrl: './booking-session.component.css',
})
export class BookingSessionComponent implements OnChanges {
  @Input() doctorId!: number | null;
  @Input() patientId!: string | null;
  @Input() showPopup: boolean = false;

  @Output() close = new EventEmitter<void>();

  sessions: any[] = [];
  uniqueDays: any[] = [];

  selectedDate: string | null = null;
  selectedSessionId: number | null = null;

  // Post-Booking Continuation Flow
  bookingCompleted: boolean = false;
  activeBooking: any = null;
  bookingLoading: boolean = false;

  // Chat AI Overlay State
  showPostBookingChatAI: boolean = false;
  selectedAppointmentId: number | null = null;

  // Chat AI logic
  complaintStarted = false;
  complaintId: string | null = null;
  loading = false;
  firstComplaintText = '';
  aiQuestion: any = null;
  textAnswer = '';
  yesOrNoAnswer: boolean | null = null;
  selectedChoices: string[] = [];

  doctorData: any = null;

  private destroyRef = inject(DestroyRef);

  constructor(
    private doctorsService: DoctorsService,
    private bookingSessionService: BookingSessionService,
    private recentAppointmentService: RecentAppointmentsService,
    private patientChatAi: PatientChatAiForEnterSessionService,
    private toastr: ToastrService,
    private router: Router,
    private localStorageService: LocalstorageService,
    private notificationService: NotificationService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showPopup'] && this.showPopup) {
      this.bookingCompleted = false;
      this.activeBooking = null;
      this.resetChatAI();
    }
    if (changes['doctorId'] && this.doctorId && this.showPopup) {
      this.loadSessions();
      this.loadDoctorProfile();
    }
  }

  loadDoctorProfile() {
    if (!this.doctorId) return;
    this.doctorsService.getDoctorProfile(this.doctorId).subscribe({
      next: (res) => {
        this.doctorData = res.data;
      },
      error: (err) => console.error(err),
    });
  }

  loadSessions() {
    this.sessions = [];
    this.uniqueDays = [];
    this.doctorsService.getSessions(this.doctorId!).subscribe({
      next: (res: any[]) => {
        /* 1️⃣ ترتيب كل السشنز بالتاريخ ثم الوقت */
        this.sessions = res.sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.start}`).getTime();
          const dateB = new Date(`${b.date} ${b.start}`).getTime();
          return dateA - dateB;
        });

        /* 2️⃣ استخراج الأيام بدون تكرار بعد الترتيب */
        this.uniqueDays = Array.from(
          new Map(this.sessions.map((s) => [s.date, s])).values(),
        );

        /* 3️⃣ اختيار أول يوم */
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
  }

  getSessionsByDate() {
    return this.sessions.filter((s) => s.date === this.selectedDate);
  }

  getLang(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lang') === 'ar' ? 'ar-EG' : 'en-US';
    }
    return 'en-US';
  }

  getDayName(date: string): string {
    return new Date(date).toLocaleDateString(this.getLang(), { weekday: 'long' });
  }

  getDayWithMonth(date: string): string {
    return new Date(date).toLocaleDateString(this.getLang(), {
      day: '2-digit',
      month: 'short',
    });
  }

  formatTime(time: string): string {
    if (!time) return '';
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
    if (!this.patientId) {
      this.toastr.warning('Please log in first to book a session.');
      return;
    }

    if (!this.selectedSessionId) {
      this.toastr.warning('Please select a time slot before booking.');
      return;
    }

    this.bookingSessionService
      .bookingSession(Number(this.patientId), this.selectedSessionId)
      .subscribe({
        next: (res: any) => {
          console.log('Booking response:', res);
          this.toastr.success(res.message || 'Session Booked Successfully');

          const selectedSession = this.sessions.find(
            (s) => s.sessionId === this.selectedSessionId,
          );

          this.activeBooking = {
            id: res?.id ?? null,
            status: res?.status ?? PatientAppointmentStatus.Created,
            session: res?.session ?? selectedSession,
            sessionId: res?.sessionId ?? selectedSession?.sessionId ?? this.selectedSessionId,
            doctorCard: res?.doctorCard ?? this.doctorData,
          };
          this.bookingCompleted = true;

          // Listen for real-time status updates while modal is open
          if (this.patientId) {
            this.notificationService.startPatientConnection(String(this.patientId));
            this.notificationService.appointmentEvents$
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe(() => {
                if (this.bookingCompleted && this.activeBooking) {
                  this.refreshBookingStatus();
                }
              });
          }
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

  refreshBookingStatus() {
    if (!this.patientId || !this.activeBooking) return;
    this.recentAppointmentService.appointmentComming(Number(this.patientId)).subscribe({
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
    return (
      this.activeBooking.status === PatientAppointmentStatus.Created ||
      this.activeBooking.status === PatientAppointmentStatus.Completed ||
      this.activeBooking.status === PatientAppointmentStatus.Canceled
    );
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
        this.closeModal();
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

  closeModal() {
    this.close.emit();
    this.selectedSessionId = null;
    this.selectedDate = null;
    this.bookingCompleted = false;
    this.activeBooking = null;
    this.resetChatAI();
  }

  // ================== Chat AI Methods ==================

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
    this.goToSession(item);
  }

  private goToSession(session: any) {
    const meeting = this.currentMeeting(session);
    if (!meeting || session.status !== 'Started') return;

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
    localStorage.setItem('channelName', meeting.channelName ?? '');
    localStorage.setItem('token', meeting.consumerToken ?? '');
    localStorage.setItem('doctorIdOnMeeting', String(session.doctorCard?.doctorId ?? ''));
    localStorage.setItem('patientId', this.patientId?.toString() || '');
    localStorage.setItem('agoraDetailsPatient', JSON.stringify(meeting));
    this.closeModal();
    this.router.navigate(['/patient/videoCall/' + session.checkUp.id]);
  }
}
