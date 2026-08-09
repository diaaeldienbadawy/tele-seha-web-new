import { PopupUploadComponent } from './../popup-upload/popup-upload.component';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { PatientReportsService } from '../../service/patient-reports.service';
import { NotificationService } from '../../service/notification.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ReportPdfService } from '../../../../shared/services/report-pdf.service';

@Component({
  selector: 'app-patient-report-radiology-section',
  imports: [CommonModule, PopupUploadComponent, TranslateModule],
  templateUrl: './patient-report-radiology-section.component.html',
  styleUrl: './patient-report-radiology-section.component.css',
})
export class PatientReportRadiologySectionComponent implements OnInit {
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

  data: any[] = [];

  patients: any;

  ngOnInit(): void {
    // Guard against a missing/malformed 'patients' entry (see lab-tests section).
    const raw = this.localStorageServices.get('patients');
    let parsed: any = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch {
      parsed = null;
    }
    this.patients = Array.isArray(parsed) ? parsed[0] : null;
    this.getAllRadiology();

    // Refresh live when the doctor requests a new radiological examination (or any report event).
    const patientId = this.localStorageServices.loggedInPatientId();
    if (patientId) this.notificationService.startPatientConnection(patientId);
    this.notificationService.reportEvents$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.getAllRadiology());
  }

  getAllRadiology() {
    const patients =
      this.localStorageServices.loggedInPatientId() ||
      this.localStorageServices.get('patientId') ||
      null;
    console.log(patients);
    if (!patients) return;
    this.prescriptionServices.getAllRadiology(patients).subscribe({
      next: (res: any) => {
        this.data = res;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  radiology: any;
  getById(data: any) {
    this.radiology = data;
    this.showPopupPrescription = true;
  }

  /** كل روابط الملفات اللي المريض بعتها على طلب معيّن (النتايج مجمّعة في أكتر من result). */
  uploadedLinks(item: any): string[] {
    const results = item?.radiologicalExaminationResult ?? [];
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
      alert('No radiology request selected.');
      return;
    }

    const formData = new FormData();
    // Attach to the selected RadiologicalExaminationRequest (not a hardcoded id). The primary
    // upload path is <app-popup-upload>; this stays correct in case it is ever re-wired.
    formData.append('RadiologicalExaminationRequestId', String(this.selectedId));

    files.forEach((file) => {
      formData.append('Files', file);
    });

    this.prescriptionServices.sendRadiologyForDoctor(formData).subscribe({
      next: (res: any) => {
        console.log('Upload success:', res);
        alert('Files uploaded successfully!');
        this.fileInput.nativeElement.value = '';
      },
      error: (err) => {
        console.error('Upload error:', err);
      },
    });
  }

  closePopupPrescription() {
    this.showPopupPrescription = false;
  }

  // Send X-ray result to doctor
  handleFiles(files: File[]) {
    console.log('Received files:', files);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
  }

  /** نفس سبب التغيير في قسم التحاليل: html2canvas على ماركب Tailwind v4 (oklch) بيفشل. */
  async downloadPDF() {
    if (this.isDownloading) return;
    this.isDownloading = true;
    try {
      await this.reportPdf.download({
        kind: 'radiology',
        reference: this.radiology?.id ?? null,
        patientName: this.patients?.name || this.localStorageServices.get('patientName'),
        doctorName: this.radiology?.doctor?.name,
        doctorSpecialty: this.radiology?.doctor?.specialty,
        issuedAt: this.radiology?.meeting?.start ?? null,
        items: (this.radiology?.radiologicalExaminations ?? []).map((rad: any) => ({
          name: rad?.name,
          details: rad?.notes,
        })),
      });
    } catch (err) {
      console.error('[Reports] Radiology PDF generation failed:', err);
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
