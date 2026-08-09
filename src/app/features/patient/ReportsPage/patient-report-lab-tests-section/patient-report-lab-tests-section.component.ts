import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { PatientReportsService } from '../../service/patient-reports.service';
import { NotificationService } from '../../service/notification.service';
import { PopupUploadComponent } from '../popup-upload/popup-upload.component';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ReportPdfService } from '../../../../shared/services/report-pdf.service';

@Component({
  selector: 'app-patient-report-lab-tests-section',
  imports: [CommonModule, PopupUploadComponent, TranslateModule],
  templateUrl: './patient-report-lab-tests-section.component.html',
  styleUrl: './patient-report-lab-tests-section.component.css',
})
export class PatientReportLabTestsSectionComponent implements OnInit {
  showPopupPrescription: boolean = false;
  isPopupUpload: boolean = false;

  readonly prescriptionServices: PatientReportsService = inject(
    PatientReportsService,
  );
  readonly localStorageServices: LocalstorageService =
    inject(LocalstorageService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reportPdf = inject(ReportPdfService);
  private readonly toastr = inject(ToastrService);

  selectedId: number | null = null;
  isDownloading = false;

  data: any;

  patients: any;

  ngOnInit(): void {
    // Guard against a missing/malformed 'patients' entry: JSON.parse(null) and null[0]
    // both throw and used to crash the whole reports page on load.
    const raw = this.localStorageServices.get('patients');
    let parsed: any = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch {
      parsed = null;
    }
    this.patients = Array.isArray(parsed) ? parsed[0] : null;
    this.getAllLabTests();

    // Refresh live when the doctor requests a new lab analysis (or any report event).
    const patientId = this.localStorageServices.loggedInPatientId();
    if (patientId) this.notificationService.startPatientConnection(patientId);
    this.notificationService.reportEvents$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.getAllLabTests());
  }

  getAllLabTests() {
    const patients =
      this.localStorageServices.loggedInPatientId() ||
      this.localStorageServices.get('patientId') ||
      null;
    console.log(patients);
    if (!patients) return;
    this.prescriptionServices.getAllLabTest(patients).subscribe({
      next: (res: any) => {
        console.log(res);

        this.data = res;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  labTest: any;
  getById(data: any) {
    this.labTest = data;
    this.showPopupPrescription = true;
  }

  /** كل روابط الملفات اللي المريض بعتها على طلب معيّن (النتايج مجمّعة في أكتر من result). */
  uploadedLinks(item: any): string[] {
    const results = item?.result ?? [];
    return results.flatMap((r: any) => r?.links ?? []);
  }

  isImage(link: string): boolean {
    const ext = link?.split('.').pop()?.toLowerCase() ?? '';
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  }

  getFileName(link: string): string {
    return link?.split('/').pop() || 'File';
  }

  openFile(link: string) {
    window.open(link, '_blank');
  }

  @ViewChild('fileInput') fileInput: any;

  selectAndSendFiles() {
    this.fileInput.nativeElement.click();
  }

  onFilesChosen(event: any) {
    const files: File[] = Array.from(event.target.files);

    if (files.length === 0) {
      alert('Please select at least one file.');
      return;
    }

    if (this.selectedId == null) {
      alert('No lab request selected.');
      return;
    }

    const formData = new FormData();
    // This is the LAB section: attach to the selected LabAnalysisRequest (not a hardcoded
    // radiology id). The primary upload path is <app-popup-upload>; this stays correct in
    // case it is ever re-wired.
    formData.append('LabAnalysisRequestId', String(this.selectedId));

    files.forEach((file) => {
      formData.append('Files', file);
    });

    this.prescriptionServices.sendLabTestForDoctor(formData).subscribe({
      next: (res: any) => {
        console.log('Upload success:', res);
        alert('Files uploaded successfully!');
        this.fileInput.nativeElement.value = '';
      },
      error: (err) => {
        console.error('Upload error:', err);
        // alert('Error uploading files.');
      },
    });
  }

  closePopupPrescription() {
    this.showPopupPrescription = false;
  }

  // Send X-ray result to doctor
  handleFiles(files: File[]) {
    console.log('Received files:', files);

    // مثال لو هتبعتهم API
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    // this.service.uploadFiles(formData).subscribe(...)
  }

  /**
   * كان بيصوّر الـ modal نفسه بـ html2canvas. ماركب الـ modal بيستخدم Tailwind v4،
   * وألوانه بتتحسب `oklch()` — دالة لون html2canvas 1.4 مش عارفاها فبترمي
   * exception، والـ promise مكانش ليها `catch` فالضغط على الزرار كان مبيعملش حاجة.
   * دلوقتي بنولّد مستند PDF مستقل بهوية المنصة (نفس السيرفس بتاع شاشة الكشف).
   */
  async downloadPDF() {
    if (this.isDownloading) return;
    this.isDownloading = true;
    try {
      await this.reportPdf.download({
        kind: 'lab',
        reference: this.labTest?.id ?? null,
        patientName: this.patients?.name || this.localStorageServices.get('patientName'),
        doctorName: this.labTest?.doctor?.name,
        doctorSpecialty: this.labTest?.doctor?.specialty,
        issuedAt: this.labTest?.meeting?.start ?? null,
        items: (this.labTest?.labAnalyses ?? []).map((lab: any) => ({
          name: lab?.name,
          details: lab?.notes,
        })),
      });
    } catch (err) {
      console.error('[Reports] Lab PDF generation failed:', err);
      this.toastr.error('تعذر تجهيز ملف الـ PDF، حاول مرة أخرى.');
    } finally {
      this.isDownloading = false;
    }
  }

  showPopupUpload(id: number) {
    this.selectedId = id;
    this.isPopupUpload = true;
  }

  closePopupUpload() {
    this.isPopupUpload = false;
  }
}
