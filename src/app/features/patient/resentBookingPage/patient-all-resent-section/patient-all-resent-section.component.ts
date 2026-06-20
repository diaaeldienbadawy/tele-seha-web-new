import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-patient-all-resent-section',
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
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

  constructor(
    readonly localStorageService: LocalstorageService,
    readonly recentAppointmentService: RecentAppointmentsService,
    readonly route: Router,
    readonly toaster: ToastrService,
    readonly patientChatAi: PatientChatAiForEnterSessionService,
    readonly sessionState: SessionStateService,
  ) {
    this.patientId = this.localStorageService.loggedInPatientId() || null;
  }

  ngOnInit(): void {
    this.loadAppointmentComming();
  }

  loadAppointmentComming() {
    if (!this.patientId) return;
    this.recentAppointmentService
      .appointmentComming(Number(this.patientId))
      .subscribe({
        next: (res) => {
          this.data = res;
          console.log(this.data);
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
      case PatientAppointmentStatus.Pending:
        return 'bg-slate-300 text-slate-500 border-transparent cursor-not-allowed';
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
        this.goToSession(item);
        break;
    }
  }

  goToSession(session: any) {
    console.log(session);

    const meeting = session?.checkUp?.meetings?.[0];
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

    localStorage.setItem(
      'meetingId',
      session.checkUp.meetings[0].id.toString(),
    );
    localStorage.setItem(
      'channelName',
      session.checkUp.meetings[0].channelName,
    );
    localStorage.setItem('token', session.checkUp.meetings[0].consumerToken);
    localStorage.setItem('doctorIdOnMeeting', session.doctorCard.doctorId);
    localStorage.setItem('patientId', this.patientId?.toString() || '');
    localStorage.setItem(
      'agoraDetailsPatient',
      JSON.stringify(session.checkUp.meetings[0]),
    );
    this.route.navigate(['/patient/videoCall/' + session.checkUp.id]);
  }

  openPopupRating() {
    this.showPopupRating = true;
  }

  closePopupRating() {
    this.showPopupRating = false;
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

    console.log('firstComplaintText:', this.firstComplaintText);

    this.patientChatAi
      .startPatientComplaint(
        this.firstComplaintText,
        this.selectedAppointmentId,
      )
      .subscribe({
        next: (res) => {
          console.log(res);

          this.complaintStarted = true;
          this.complaintId = res.patientMedicalComplaintId;
          this.aiQuestion = res.bodyValue;
          this.resetAnswers();
        },
        error: (err) => {
          console.log(err);
        },
      });
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
        console.log('Two');
        console.log(res);

        this.aiQuestion = res.bodyValue;
        this.resetAnswers();
        this.loading = false;
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
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
    console.log('selectedStep', this.selectedStep);
  }

  getSelectedColor() {
    return this.steps.find((s) => s.value === this.selectedStep);
  }

  getMeetingSatisfactionRatio() {
    if (!this.checkUpId) return;
    this.recentAppointmentService
      .getMeetingSatisfactionRatio(this.checkUpId, this.selectedStep)
      .subscribe({
        next: (res) => {
          console.log(res);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
}
