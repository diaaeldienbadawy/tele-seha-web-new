import { LocalstorageService } from './../../../../core/services/localstorage.service';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PatientReportsService } from '../../service/patient-reports.service';
import { NotificationService } from '../../service/notification.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-patient-report-prescriptions-section',
  imports: [CommonModule, TranslateModule],
  templateUrl: './patient-report-prescriptions-section.component.html',
  styleUrl: './patient-report-prescriptions-section.component.css',
})
export class PatientReportPrescriptionsSectionComponent implements OnInit {
  showPopupPrescription: boolean = false;

  readonly prescriptionServices: PatientReportsService = inject(
    PatientReportsService,
  );
  readonly localStorageServices: LocalstorageService =
    inject(LocalstorageService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  data: any;

  patients: any;

  ngOnInit(): void {
    const patients =
      JSON.parse(this.localStorageServices.get('patients')) || null;
    this.patients = patients[0];
    this.getAllPrescription();

    // Refresh live when the doctor issues a new prescription (or any report event).
    const patientId = this.localStorageServices.loggedInPatientId();
    if (patientId) this.notificationService.startPatientConnection(patientId);
    this.notificationService.reportEvents$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.getAllPrescription());
  }

  getAllPrescription() {
    const patients =
      this.localStorageServices.loggedInPatientId() ||
      this.localStorageServices.get('patientId') ||
      null;
    console.log(patients);
    if (!patients) return;

    if (!patients) return;
    this.prescriptionServices.getAllprescription(patients).subscribe({
      next: (res: any) => {
        console.log(res);

        this.data = res;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  medicines: any;
  getById(data: any) {
    console.log('data', data);
    this.medicines = data;
    this.showPopupPrescription = true;
  }

  downloadPDF() {
    const DATA = document.getElementById('prescriptionContent');

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

      pdf.save('Prescription.pdf');
    });
  }

  closePopupPrescription() {
    this.showPopupPrescription = false;
  }
}
