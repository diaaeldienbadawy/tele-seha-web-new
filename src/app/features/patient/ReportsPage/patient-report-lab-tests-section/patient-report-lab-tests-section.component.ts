import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { PatientReportsService } from '../../service/patient-reports.service';
import { NotificationService } from '../../service/notification.service';
import { PopupUploadComponent } from '../popup-upload/popup-upload.component';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { TranslateModule } from '@ngx-translate/core';
import { exportReportToPdf } from '../../../../shared/utils/pdf-exporter';

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

  selectedId: number | null = null;

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

  async downloadPDF() {
    const filename = `LabTest_LAB-${this.labTest?.id || 'Request'}.pdf`;
    await exportReportToPdf('labTestContent', filename);
  }

  showPopupUpload(id: number) {
    this.selectedId = id;
    this.isPopupUpload = true;
  }

  closePopupUpload() {
    this.isPopupUpload = false;
  }
}
