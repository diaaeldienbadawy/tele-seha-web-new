import { DoctorAuthService } from './../../service/doctor-auth.service';
import { Component, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MeetingDiagnosisStateService } from '../../service/meeting-diagnosis-state.service';
import { CommonModule } from '@angular/common';
import { AddEditPrescriptionComponent } from './add-edit-prescription/add-edit-prescription.component';
import { AddEditLabtestComponent } from './add-edit-labtest/add-edit-labtest.component';
import { AddEditRadiologyComponent } from './add-edit-radiology/add-edit-radiology.component';
import { BookFollowUpComponent } from './book-follow-up/book-follow-up.component';
import { AddEditDiagnosisComponent } from './add-edit-diagnosis/add-edit-diagnosis.component';

@Component({
  selector: 'app-popup-doctor',
  imports: [
    CommonModule,
    AddEditPrescriptionComponent,
    AddEditLabtestComponent,
    AddEditRadiologyComponent,
    AddEditDiagnosisComponent,
    BookFollowUpComponent,
  ],
  templateUrl: './popup-doctor.component.html',
  styleUrl: './popup-doctor.component.css',
})
export class PopupDoctorComponent {
  constructor(readonly DoctorAuthService: DoctorAuthService) {}

  private readonly diagnosisState = inject(MeetingDiagnosisStateService);
  private readonly toastr = inject(ToastrService);

  /**
   * الروشتة والتحاليل والأشعة كلها مبنية على التشخيص — مالهاش معنى قبله، والسيرفر
   * كمان بيرفض إنهاء الكشف من غير تشخيص. فبنقفلها لحد ما الطبيب يسجّل التشخيص.
   */
  readonly hasDiagnosis = this.diagnosisState.hasDiagnosis;
  readonly blockedReason = this.diagnosisState.blockedReason;

  showPopupPrescription: boolean = false;
  showPopupRadiology: boolean = false;
  showPopupLabTests: boolean = false;
  showPopupDiagnosis: boolean = false;
  bookFollowUp: boolean = false;

  /** حماية إضافية لو الزرار اتفعّل بأي طريقة (keyboard / DOM). */
  private requireDiagnosis(): boolean {
    if (this.hasDiagnosis()) return true;
    this.toastr.info(this.blockedReason());
    return false;
  }

  // Prescription
  openPopupPrescription() {
    if (!this.requireDiagnosis()) return;
    this.showPopupPrescription = true;
  }
  closePrescription() {
    this.showPopupPrescription = false;
  }

  // Radiology
  openPopupRadiology() {
    if (!this.requireDiagnosis()) return;
    this.showPopupRadiology = true;
  }
  closeRadiology() {
    this.showPopupRadiology = false;
  }
  // Lab Tests
  openPopupLabTests() {
    if (!this.requireDiagnosis()) return;
    this.showPopupLabTests = true;
  }
  closeLabTest() {
    this.showPopupLabTests = false;
  }

  // Diagnosis
  openPopupDiagnosis() {
    this.showPopupDiagnosis = true;
  }
  closeDiagnosis() {
    this.showPopupDiagnosis = false;
  }

  // Book Follow Up
  openPopupBookFollowUp() {
    this.bookFollowUp = true;
  }

  closeBookFollowUp() {
    this.bookFollowUp = false;
  }
}
