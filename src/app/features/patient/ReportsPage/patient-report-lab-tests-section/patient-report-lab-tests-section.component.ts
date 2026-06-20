import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { PatientReportsService } from '../../service/patient-reports.service';
import { PopupUploadComponent } from '../popup-upload/popup-upload.component';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { TranslateModule } from '@ngx-translate/core';

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

  selectedId: number | null = null;

  data: any;

  patients: any;

  ngOnInit(): void {
    const patients =
      JSON.parse(this.localStorageServices.get('patients')) || null;
    this.patients = patients[0];
    this.getAllLabTests();
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

    const formData = new FormData();
    formData.append('RadiologicalExaminationRequestId', '1');

    files.forEach((file) => {
      // formData.append('Files[]', file);
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

  downloadPDF() {
    const DATA = document.getElementById('labTestContent');

    if (!DATA) return;

    html2canvas(DATA, {
      scale: 2,
      useCORS: true,
    }).then((canvas) => {
      const imgWidth = 210;
      const pageHeight = 295;

      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const contentDataURL = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');

      pdf.addImage(contentDataURL, 'PNG', 0, 0, imgWidth, imgHeight);

      pdf.save('LabTest.pdf');
    });
  }

  showPopupUpload(id: number) {
    this.selectedId = id;
    this.isPopupUpload = true;
  }

  closePopupUpload() {
    this.isPopupUpload = false;
  }
}
