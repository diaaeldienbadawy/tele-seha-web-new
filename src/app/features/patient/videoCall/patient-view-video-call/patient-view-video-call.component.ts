import { doctorGuard } from './../../../../core/guards/doctor.guard';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, inject, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from '../../service/notification.service';
import { PatientMeetingVideoCallComponent } from '../patient-meeting-video-call/patient-meeting-video-call.component';
import { PatientSendPictureVideoCallComponent } from '../patient-send-picture-video-call/patient-send-picture-video-call.component';
import { PatientChatVideoCallComponent } from '../patient-chat-video-call/patient-chat-video-call.component';
import { PatientService } from '../../../../shared/services/patient.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PatientVideoCallService } from '../../service/patient-video-call.service';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-patient-view-video-call',
  imports: [
    CommonModule,
    PatientMeetingVideoCallComponent,
    PatientChatVideoCallComponent,
    PatientSendPictureVideoCallComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './patient-view-video-call.component.html',
  styleUrl: './patient-view-video-call.component.css',
})
export class PatientViewVideoCallComponent implements OnInit {
  showWhatsapp = false;

  ratingForm!: FormGroup;
  selectedRating = 0;
  selectedCallTimeRating = 0;

  agoraDetailsPatient: any;

  meetingReport: any;
  currentSection = 0; // 0: Lab, 1: Radiology, 2: Prescription

  meetingId!: number;
  sessionId!: number;
  isValidating = true;
  isMeetingValid = false;

  @ViewChild(PatientMeetingVideoCallComponent)
  private meetingChild?: PatientMeetingVideoCallComponent;

  private destroyRef = inject(DestroyRef);

  constructor(
    @Inject(PLATFORM_ID) readonly platformId: Object,
    readonly patientService: PatientService,
    readonly patientVideoCall: PatientVideoCallService,
    private localstorageService: LocalstorageService,
    readonly toastr: ToastrService,
    readonly fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
  ) {}
  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.sessionId = Number(params['sessionId']);
      if (this.sessionId) {
        this.getMeetingReportsByCheckup(this.sessionId);
      }
    });

    // When the doctor ends the meeting, the backend pushes `meeting_closed`. Leave the
    // channel immediately and show the "session ended" screen instead of leaving the
    // patient staring at a dead call until the fallback timer fires.
    const patientId = this.localstorageService.loggedInPatientId();
    if (patientId) {
      this.notificationService.startPatientConnection(patientId);
    }
    this.notificationService.meetingEvents$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((evt: any) => {
        if (evt?.event === 'meeting_closed') {
          void this.meetingChild?.endCall();
          this.handleSessionEnded();
        }
      });

    const data = this.localstorageService.get('agoraDetailsPatient');
    const doctorId = Number(this.localstorageService.get('doctorIdOnMeeting'));
    if (data) {
      this.agoraDetailsPatient = JSON.parse(data);
    }
    console.log("this.agoraDetailsPatient?.checkUpId" , this.agoraDetailsPatient?.checkUpId);
    console.log("this.agoraDetailsPatient?.checkUpId" , doctorId);

    this.ratingForm = this.fb.group({
      rating: [0],
      review: [''],
      call_time_rating: [0],
      is_first_advantage: [false],
      is_second_advantage: [false],
      is_third_advantage: [false],
      meeting_id: [0],
      doctor_id: [doctorId || 0],
    });
  }

  getMettingDetails() {
    this.patientVideoCall.getMeetingDetails(this.meetingId).subscribe({
      next: () => {},
      error: (err) => {
        console.error('[VideoCall] Failed to load meeting details:', err);
      },
    });
  }
  getMeetingReportsByCheckup(sessionId: number) {
    this.patientVideoCall.getMeetingReportsByCheckup(sessionId).subscribe({
      next: (res) => {
        this.meetingReport = res;
        this.meetingId = res?.meetingId;
        this.currentSection = 0;

        // حالة الاجتماع بتيجي من السيرفر بس — مش من ساعة المتصفح. العيادات بتتأخر،
        // فطالما الطبيب لسه ماقفلش المكالمة المريض يفضل جواها حتى لو عدّت مدة الـ slot.
        // بنطرد المريض بس لو السيرفر قال Completed(2) أو Canceled(3)؛ إنهاء المكالمة
        // الحقيقي بيوصل لحظيًا عبر meetingEvents$ (meeting_closed).
        if (res?.status === 2 || res?.status === 3) {
          const message = res?.status === 3
            ? 'هذه الجلسة تم إلغاؤها'
            : 'هذه الجلسة انتهت بالفعل';
          this.toastr.warning(message);
          this.router.navigate(['/patient/home']);
          return;
        }

        // Only render the meeting if it's ongoing and valid
        this.isMeetingValid = true;
        this.isValidating = false;

        if (this.meetingId) {
          // doctor_id from the server, not localStorage: a missing 'doctorIdOnMeeting' key
          // used to send doctor_id = 0 and the rating never reached the doctor's aggregates.
          this.ratingForm.patchValue({
            meeting_id: this.meetingId,
            doctor_id: res?.doctorId ?? this.ratingForm.value.doctor_id ?? 0,
          });
          this.getMettingDetails();
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('فشل تحميل بيانات الجلسة');
        this.router.navigate(['/patient/home']);
      },
    });
  }

  nextSection() {
    if (this.currentSection < 2) {
      this.currentSection++;
    } else {
      this.currentSection = 0;
    }
  }

  setSection(index: number) {
    this.currentSection = index;
  }

  exitMeeting() {
    this.router.navigate(['/patient/home']);
  }

  downloadPrescription() {
    const element = document.createElement('a');
    const content = this.generatePrescriptionText();
    const blob = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(blob);
    element.download = `Prescription_RX-${this.meetingReport?.prescription?.id || 'NotFound'}.txt`;
    element.click();
    URL.revokeObjectURL(element.href);
  }

  generatePrescriptionText(): string {
    let text = '--- Prescription ---\n\n';
    text += `Patient: ${this.agoraDetailsPatient?.patientName || 'Not Found'}\n`;
    text += `Doctor: ${this.agoraDetailsPatient?.doctor?.name || 'Not Found'}\n\n`;

    // Lab Analyses
    text += 'Lab Analyses:\n';
    if (this.meetingReport?.labAnalysisRequest?.labAnalyses?.length) {
      this.meetingReport.labAnalysisRequest.labAnalyses.forEach((lab: any) => {
        text += `- ${lab.name} (${lab.notes || 'No Notes'})\n`;
      });
    } else text += 'Not Found\n';

    // Radiology
    text += '\nRadiological Examinations:\n';
    if (
      this.meetingReport?.radiologicalExaminationRequest
        ?.radiologicalExaminations?.length
    ) {
      this.meetingReport.radiologicalExaminationRequest.radiologicalExaminations.forEach(
        (rad: any) => {
          text += `- ${rad.name} (${rad.notes || 'No Notes'})\n`;
        },
      );
    } else text += 'Not Found\n';

    // Prescription
    text += '\nMedicines:\n';
    if (this.meetingReport?.prescription?.medicines?.length) {
      this.meetingReport.prescription.medicines.forEach((med: any) => {
        text += `- ${med.name}: ${med.instructions}\n`;
      });
    } else text += 'Not Found\n';

    return text;
  }

  showPopupSessionSuccess: boolean = false;
  showPopupRating: boolean = false;
  showPopupPrescription: boolean = false;

  openPopupRating() {
    this.showPopupRating = true;
  }
  closePopupRating() {
    this.showPopupRating = false;
  }

  openPopupSessionSuccess() {
    this.showPopupSessionSuccess = true;
  }
  closePopupSessionSuccess() {
    this.showPopupSessionSuccess = false;
  }

  openPopupPrescription() {
    this.showPopupPrescription = true;
  }
  closePopupPrescription() {
    this.showPopupPrescription = false;
  }

  /**
   * نقطة النهاية الموحّدة (زرار الإنهاء أو meeting_closed من السيرفر):
   * لو المريض قيّم قبل كدا، كارت "شكراً — قيّم الدكتور" نفسه بيتخطى بالكامل
   * وبنعرض التقارير مباشرة (ممكن تكون اتحدثت أثناء المكالمة).
   */
  handleSessionEnded() {
    if (this.meetingReport?.isRated) {
      this.refreshReports(true);
      return;
    }
    this.showPopupSessionSuccess = true;
  }

  /**
   * تحديث التقارير من غير طرد: getMeetingReportsByCheckup بتودّي المريض للهوم لو
   * الاجتماع مقفول — دا صح عند الدخول، لكنه غلط في نص فلو الخروج/التقييم.
   */
  private refreshReports(openPopup: boolean) {
    if (!this.sessionId) {
      if (openPopup) this.showPopupPrescription = true;
      return;
    }
    this.patientVideoCall.getMeetingReportsByCheckup(this.sessionId).subscribe({
      next: (res) => {
        this.meetingReport = res;
        if (openPopup) this.showPopupPrescription = true;
      },
      error: () => {
        // حتى لو التحديث فشل بنعرض آخر نسخة موجودة بدل ما نحبس المريض.
        if (openPopup) this.showPopupPrescription = true;
      },
    });
  }

  openshowPopupRating() {
    this.showPopupSessionSuccess = false;

    // سبق للمريض تقييم الجلسة دي (خرج ورجع تاني): منطلبش تقييم تاني —
    // نوديه على التقارير مباشرة لأنها ممكن تكون اتحدثت أثناء المكالمة.
    if (this.meetingReport?.isRated) {
      this.refreshReports(true);
      return;
    }

    this.showPopupRating = true;
  }

  setRating(value: number) {
    this.selectedRating = value;
    this.ratingForm.patchValue({
      rating: value,
    });
  }

  setCallTimeRating(value: number) {
    this.selectedCallTimeRating = value;
    this.ratingForm.patchValue({
      call_time_rating: value,
    });
  }

  toggleAdvantage(
    field: 'is_first_advantage' | 'is_second_advantage' | 'is_third_advantage',
  ) {
    const current = this.ratingForm.get(field)?.value;
    this.ratingForm.patchValue({
      [field]: !current,
    });
  }

  ratingReview() {
    if (this.ratingForm.invalid) return;

    const payload = this.ratingForm.value;

    console.log('Payload sent:', payload);

    this.patientService.ratingReviewDoctor(payload).subscribe({
      next: () => {
        this.toastr.success('تم إرسال التقييم بنجاح');
        this.showPopupRating = false;
        // تحديث بدون طرد: بيجيب isRated=true وأحدث تقارير ثم يفتح نافذة التقارير.
        this.refreshReports(true);
      },
      error: (err) => {
        const apiError = err?.error;

        // BadRequest بيرجع نص مباشر مش {message}: من غير الفرع ده الرسالة كانت
        // بتضيع/تظهر مبتورة. لو الجلسة متقيّمة بالفعل كمّل للتقارير بدل ما نحبس المريض.
        const message =
          apiError?.message ??
          (typeof apiError === 'string' && apiError ? apiError : null);

        if (message) {
          this.toastr.error(message);
          if (message.includes('بالفعل')) {
            this.showPopupRating = false;
            this.showPopupPrescription = true;
          }
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
          return;
        }

        this.toastr.error('تعذر إرسال التقييم، حاول مرة أخرى.');
      },
    });
  }

  onSessionEnded() {
    this.handleSessionEnded();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    localStorage.removeItem('agoraDetailsPatient');
    localStorage.removeItem('meetingId');
    localStorage.removeItem('channelName');
    localStorage.removeItem('checkUpId');
    localStorage.removeItem('patientId');
    localStorage.removeItem('meetingToken');
  }
}
