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
import {
  ReportPdfData,
  ReportPdfItem,
  ReportPdfKind,
  ReportPdfService,
} from '../../../../shared/services/report-pdf.service';

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
  private reportPdf = inject(ReportPdfService);
  /** بيمنع الضغط المتكرر أثناء توليد الـ PDF (بياخد لحظة على الأجهزة البطيئة). */
  isDownloading = false;

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
    this.refreshQr();
  }

  setSection(index: number) {
    this.currentSection = index;
    this.refreshQr();
  }

  /** QR حقيقي للمستند المعروض — كان صورة placeholder ثابتة. */
  qrDataUrl: string | null = null;

  private refreshQr(): void {
    const kind = this.currentPdfKind();
    const data = this.buildPdfData(kind);
    this.reportPdf
      .qrForReport({ kind, reference: data.reference })
      .then((url) => (this.qrDataUrl = url))
      .catch(() => (this.qrDataUrl = null));
  }

  exitMeeting() {
    this.router.navigate(['/patient/home']);
  }

  /**
   * تنزيل المستند اللي المريض واقف عليه (تحاليل / أشعة / روشتة) كـ PDF منسّق
   * بهوية المنصة و QR بيفتح المستند. قبل كده الزرار كان بينزّل ملف `.txt` فيه
   * الأقسام الثلاثة مع بعض من غير أي تنسيق.
   */
  async downloadPrescription() {
    if (this.isDownloading) return;
    this.isDownloading = true;
    try {
      await this.reportPdf.download(this.buildPdfData(this.currentPdfKind()));
    } catch (err) {
      console.error('[VideoCall] PDF generation failed:', err);
      this.toastr.error('تعذر تجهيز ملف الـ PDF، حاول مرة أخرى.');
    } finally {
      this.isDownloading = false;
    }
  }

  /** 0: تحاليل، 1: أشعة، 2: روشتة — نفس ترتيب الـ tabs في الواجهة. */
  private currentPdfKind(): ReportPdfKind {
    if (this.currentSection === 0) return 'lab';
    if (this.currentSection === 1) return 'radiology';
    return 'prescription';
  }

  private buildPdfData(kind: ReportPdfKind): ReportPdfData {
    const report = this.meetingReport ?? {};
    const stored = this.agoraDetailsPatient ?? {};

    let items: ReportPdfItem[] = [];
    let reference: string | number | null = null;

    if (kind === 'lab') {
      reference = report?.labAnalysisRequest?.id ?? null;
      items = (report?.labAnalysisRequest?.labAnalyses ?? []).map((lab: any) => ({
        name: lab?.name,
        details: lab?.notes,
      }));
    } else if (kind === 'radiology') {
      reference = report?.radiologicalExaminationRequest?.id ?? null;
      items = (
        report?.radiologicalExaminationRequest?.radiologicalExaminations ?? []
      ).map((rad: any) => ({ name: rad?.name, details: rad?.notes }));
    } else {
      reference = report?.prescription?.id ?? null;
      items = (report?.prescription?.medicines ?? []).map((med: any) => ({
        name: med?.name,
        details: med?.instructions,
      }));
    }

    // الأسماء بتيجي من السيرفر أولًا (MeetingReportsDto)؛ الباقي fallback عشان
    // الواجهة تفضل شغالة حتى لو الـ API لسه على نسخة أقدم.
    return {
      kind,
      reference,
      items,
      patientName:
        report?.patientName ||
        stored?.patient?.name ||
        stored?.patientName ||
        this.localstorageService.get('patientName') ||
        '',
      doctorName: report?.doctorName || stored?.doctor?.name || '',
      doctorSpecialty:
        report?.doctorSpecialty ||
        stored?.doctor?.speciality ||
        stored?.doctor?.subspecialty ||
        stored?.doctor?.jobTitleAr ||
        '',
      doctorLicense: stored?.doctor?.licenseNumber || '',
      issuedAt: report?.start ?? null,
    };
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
    this.refreshQr();
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
      if (openPopup) this.openPopupPrescription();
      return;
    }
    this.patientVideoCall.getMeetingReportsByCheckup(this.sessionId).subscribe({
      next: (res) => {
        this.meetingReport = res;
        if (openPopup) {
          this.showPopupPrescription = true;
          this.refreshQr();
        }
      },
      error: () => {
        // حتى لو التحديث فشل بنعرض آخر نسخة موجودة بدل ما نحبس المريض.
        if (openPopup) this.openPopupPrescription();
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
            this.openPopupPrescription();
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
