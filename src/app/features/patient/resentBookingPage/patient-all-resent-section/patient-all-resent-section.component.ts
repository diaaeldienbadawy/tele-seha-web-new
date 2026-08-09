import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { RecentAppointmentsService } from '../../../../shared/services/recent-appointments.service';
import { Router, RouterLink } from '@angular/router';
import { PatientAppointmentStatus } from '../../../../core/enum/patientAppointmentStatus';
import { PatientChatAiForEnterSessionService } from '../../../../shared/services/patient-chat-ai-for-enter-session.service';
import { FormsModule } from '@angular/forms';
import { SessionStateService } from '../../../../shared/services/session-state.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '../../../patient/service/notification.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-patient-all-resent-section',
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule, ConfirmDialogComponent],
  templateUrl: './patient-all-resent-section.component.html',
  styleUrl: './patient-all-resent-section.component.css',
})
export class PatientAllResentSectionComponent implements OnInit {
  // ================== Existing ==================
  textButton: string = '';
  patientId: string | null = null;
  data: any;
  selectedAppointmentId: number | null = null;

  checkUpId!: number;

  showPopupRating: boolean = false;
  showPopupChatAI: boolean = false;

  // إلغاء الحجز
  showCancelModal: boolean = false;
  appointmentToCancelId: number | null = null;
  cancelingAppointment: boolean = false;

  // الحجز اللي مستني المريض يجاوب على نسبة التحسن قبل ما يدخل مكالمته.
  pendingSession: any = null;
  sendingRatio = false;

  private destroyRef = inject(DestroyRef);

  constructor(
    readonly localStorageService: LocalstorageService,
    readonly recentAppointmentService: RecentAppointmentsService,
    readonly route: Router,
    readonly toaster: ToastrService,
    readonly patientChatAi: PatientChatAiForEnterSessionService,
    readonly sessionState: SessionStateService,
    readonly notificationService: NotificationService,
  ) {
    this.patientId = this.localStorageService.loggedInPatientId() || null;
  }

  ngOnInit(): void {
    this.loadAppointmentComming();

    // Ensure the realtime hub is connected even when this page is opened directly
    // (deep-link / refresh) rather than only after visiting the home page.
    if (this.patientId) {
      this.notificationService.startPatientConnection(this.patientId);
    }

    // Real-time appointment updates (unsubscribed automatically on destroy)
    this.notificationService.appointmentEvents$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadAppointmentComming();
      });
  }

  loadAppointmentComming() {
    if (!this.patientId) return;
    const pid = Number(this.patientId);
    // Show upcoming AND past bookings together: `comming` (Status <= Started) 404s / returns
    // nothing once every booking is finished, so on its own the page emptied out and the whole
    // history was lost. History (Completed/Canceled) is appended after the active ones. Each
    // call is guarded so one empty/failed side does not blank the other.
    forkJoin({
      comming: this.recentAppointmentService
        .appointmentComming(pid)
        .pipe(catchError(() => of([]))),
      history: this.recentAppointmentService
        .appointmentHistory(pid)
        .pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ comming, history }) => {
        const active = Array.isArray(comming) ? comming : [];
        const past = Array.isArray(history) ? history : [];
        this.data = [...active, ...past];
      },
    });
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
        // Pending IS clickable — it navigates to the waiting room — so it must not look disabled.
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

  isDisabled(status: PatientAppointmentStatus | string): boolean {
    return (
      status === PatientAppointmentStatus.Created ||
      status === PatientAppointmentStatus.Completed ||
      status === PatientAppointmentStatus.Canceled
    );
  }

  canCancel(status: PatientAppointmentStatus | string): boolean {
    return (
      status !== PatientAppointmentStatus.Started &&
      status !== PatientAppointmentStatus.Completed &&
      status !== PatientAppointmentStatus.Canceled &&
      status !== 'Started' &&
      status !== 'Completed' &&
      status !== 'Canceled'
    );
  }

  openCancelModal(appointmentId: number) {
    this.appointmentToCancelId = appointmentId;
    this.showCancelModal = true;
  }

  closeCancelModal() {
    this.showCancelModal = false;
    this.appointmentToCancelId = null;
    this.cancelingAppointment = false;
  }

  confirmCancel() {
    if (!this.appointmentToCancelId || this.cancelingAppointment) return;
    this.cancelingAppointment = true;

    this.recentAppointmentService.cancelAppointment(this.appointmentToCancelId).subscribe({
      next: () => {
        this.cancelingAppointment = false;
        this.toaster.success('تم إلغاء الحجز بنجاح.');
        this.closeCancelModal();
        this.loadAppointmentComming();
      },
      error: (err) => {
        this.cancelingAppointment = false;
        const apiError = err?.error;
        this.toaster.error(
          apiError?.message ||
            (typeof apiError === 'string' && apiError ? apiError : 'تعذر إلغاء الحجز.'),
        );
      },
    });
  }

  handleButtonClick(item: any) {
    switch (item.status) {
      case PatientAppointmentStatus.Confirmed:
        console.log('item:', item.id);
        this.recentAppointmentService.paying(item.id).subscribe({
          next: (res) => {
            console.log(res);

            this.loadAppointmentComming();
          },
          error: (err) => {
            const apiError = err?.error;

            if (apiError?.message) {
              this.toaster.error(apiError.message);
              return;
            }

            if (apiError?.errors) {
              Object.entries(apiError.errors).forEach(
                ([key, messages]: [string, any]) => {
                  messages.forEach((msg: string) => {
                    this.toaster.error(`${key} : ${msg}`);
                  });
                },
              );
            }
          },
        });
        break;

      case PatientAppointmentStatus.CreateComplaint:
        this.selectedAppointmentId = item.id;
        this.openPopupChatAI();
        break;

      case PatientAppointmentStatus.Pending:
        this.localStorageService.set('sessionState', JSON.stringify(item));
        this.route.navigate([
          '/patient/allResent',
          item.sessionId,
          'waitingSession',
        ]);
        break;

      case PatientAppointmentStatus.Started:
        this.enterStartedSession(item);
        break;
    }
  }

  /**
   * Pick the CURRENT (ongoing) meeting, not meetings[0]. For a check-up with
   * follow-ups, meetings[0] is the oldest/closed meeting, whose channel/token
   * would be wrong. Fall back to the most recent meeting if none is flagged ongoing.
   */
  private currentMeeting(session: any): any | null {
    const meetings: any[] = session?.checkUp?.meetings ?? [];
    return (
      meetings.find((m) => m?.status === 'Ongoing') ??
      meetings[meetings.length - 1] ??
      null
    );
  }

  /**
   * دخول جلسة شغّالة. لو دي متابعة ولسه محدّدش نسبة تحسنه، بنسأله الأول —
   * السؤال نفسه ("مستوى تحسنك بعد الكشف الأخير") مالوش معنى في كشف أول،
   * ومالوش لزوم تاني لو الرقم اتسجّل قبل كدا (خرج ورجع للمكالمة).
   */
  private enterStartedSession(item: any) {
    const meeting = this.currentMeeting(item);

    if (meeting?.isFollowUp && !meeting?.satisfactionRatio) {
      this.pendingSession = item;
      this.checkUpId = item?.checkUp?.id;
      this.selectedStep = 0;
      this.showPopupRating = true;
      return;
    }

    this.goToSession(item);
  }

  goToSession(session: any) {
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

    // كل القيم defensive: أي نقص في البيانات ميمنعش الدخول للمكالمة —
    // كراش هنا كان بيسيب المريض واقف واللستة بتقوله "ادخل الجلسة".
    localStorage.setItem('meetingId', String(meeting.id));
    localStorage.setItem('channelName', meeting.channelName ?? '');
    localStorage.setItem('token', meeting.consumerToken ?? '');
    localStorage.setItem('doctorIdOnMeeting', String(session.doctorCard?.doctorId ?? ''));
    localStorage.setItem('patientId', this.patientId?.toString() || '');
    localStorage.setItem('agoraDetailsPatient', JSON.stringify(meeting));
    this.route.navigate(['/patient/videoCall/' + session.checkUp.id]);
  }

  /**
   * إغلاق/تخطي: التقييم مايمنعش المريض من دخول مكالمة طبية بأي حال —
   * بنقفل البوب أب وندخّله الجلسة على طول.
   */
  closePopupRating() {
    this.showPopupRating = false;
    const session = this.pendingSession;
    this.pendingSession = null;
    if (session) this.goToSession(session);
  }

  openPopupChatAI() {
    this.showPopupChatAI = true;
  }

  closePopupChatAI() {
    this.showPopupChatAI = false;
    this.resetChatAI();
  }

  // ================= Chat AI Logic =====================

  complaintStarted = false;
  complaintId: string | null = null;
  loading = false;
  firstComplaintText = '';
  aiQuestion: any = null;

  // answers
  textAnswer = '';
  yesOrNoAnswer: boolean | null = null;
  selectedChoices: string[] = [];

  /** أول مرة فقط */
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

          // لما الفحص يكتمل السيرفر بيرجع 200 فاضي (من غير bodyValue) — الكود القديم
          // كان بيعمل res.bodyValue على null فبيكرش والبوب أب يفضل معلّق للأبد.
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

  /** الفحص خلص: اقفل البوب أب وحدّث اللستة وطمّن المريض. */
  private finishComplaint() {
    this.closePopupChatAI();
    this.toaster.success('تم إرسال الشكوى بنجاح — الطبيب سيبدأ معك في موعد الجلسة.');
    this.loadAppointmentComming();
  }

  private showComplaintError(err: any) {
    const apiError = err?.error;
    const message =
      apiError?.message ??
      (typeof apiError === 'string' && apiError ? apiError : null);

    if (message === 'مقيد') {
      // الموديل أنهى الحوار (إجابات خارج السياق مرتين): اقفل ورجّع المريض يبدأ من جديد.
      this.toaster.warning('تم إنهاء المحادثة — برجاء المحاولة مرة أخرى بوصف واضح للشكوى.');
      this.closePopupChatAI();
      return;
    }

    if (message?.includes('ابدأ من جديد')) {
      // الجلسة انتهت فعلاً (خمول طويل): نرجّع البوب أب لأول خطوة عشان يكتب شكوته تاني.
      this.toaster.warning(message);
      this.resetChatAI();
      return;
    }

    this.toaster.error(message || 'تعذر التواصل مع المساعد الذكي، حاول مرة أخرى.');
  }

  /** رد المستخدم على AI */
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

    console.log('One', answer);

    this.patientChatAi.patientComplaint(answer, this.complaintId).subscribe({
      next: (res) => {
        this.loading = false;

        // اكتمال الفحص = 200 فاضي: اقفل وحدّث بدل الكراش على res.bodyValue.
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

  // ================= Rating Logic =====================
  selectedStep = 0;

  steps = [
    { value: 25, label: '25%', color: '#DC8560', text: '#FFFFFF' },
    { value: 50, label: '50%', color: '#E2E2E2', text: '#1E1E1E' },
    { value: 75, label: '75%', color: '#FFBD61', text: '#FFFFFF' },
    { value: 100, label: '100%', color: '#2E7D32', text: '#FFFFFF' },
  ];

  selectStep(value: number) {
    this.selectedStep = value;
  }

  getSelectedColor() {
    return this.steps.find((s) => s.value === this.selectedStep);
  }

  /**
   * إرسال نسبة التحسن ثم الدخول للجلسة. الإرسال بيروح على أحدث ميتينج في الكشف
   * (وهو ميتينج المتابعة اللي داخل عليه دلوقتي) — دي دلالة الـ endpoint الحالية.
   * فشل الإرسال بيتعرض كتوست بس ما بيوقفش الدخول: المكالمة أهم من الرقم.
   */
  sendSatisfactionRatio() {
    if (!this.checkUpId || !this.selectedStep || this.sendingRatio) return;
    this.sendingRatio = true;

    this.recentAppointmentService
      .getMeetingSatisfactionRatio(this.checkUpId, this.selectedStep)
      .subscribe({
        next: () => {
          this.sendingRatio = false;
          this.closePopupRating();
        },
        error: (err) => {
          this.sendingRatio = false;
          const apiError = err?.error;
          const message =
            apiError?.message ??
            (typeof apiError === 'string' && apiError ? apiError : null);
          this.toaster.error(message || 'تعذر إرسال نسبة التحسن.');
          this.closePopupRating();
        },
      });
  }
}
