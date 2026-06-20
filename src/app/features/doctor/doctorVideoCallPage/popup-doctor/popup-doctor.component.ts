import { DoctorAuthService } from './../../service/doctor-auth.service';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddEditPrescriptionComponent } from './add-edit-prescription/add-edit-prescription.component';
import { AddEditLabtestComponent } from './add-edit-labtest/add-edit-labtest.component';
import { AddEditRadiologyComponent } from './add-edit-radiology/add-edit-radiology.component';
import { BookFollowUpComponent } from './book-follow-up/book-follow-up.component';

@Component({
  selector: 'app-popup-doctor',
  imports: [
    CommonModule,
    AddEditPrescriptionComponent,
    AddEditLabtestComponent,
    AddEditRadiologyComponent,
    BookFollowUpComponent,
  ],
  templateUrl: './popup-doctor.component.html',
  styleUrl: './popup-doctor.component.css',
})
export class PopupDoctorComponent {
  constructor(readonly DoctorAuthService: DoctorAuthService) {}

  showPopupPrescription: boolean = false;
  showPopupRadiology: boolean = false;
  showPopupLabTests: boolean = false;
  bookFollowUp: boolean = false;

  // Prescription
  openPopupPrescription() {
    this.showPopupPrescription = true;
  }
  closePrescription() {
    this.showPopupPrescription = false;
  }

  // Radiology
  openPopupRadiology() {
    this.showPopupRadiology = true;
  }
  closeRadiology() {
    this.showPopupRadiology = false;
  }
  // Lab Tests
  openPopupLabTests() {
    this.showPopupLabTests = true;
  }
  closeLabTest() {
    this.showPopupLabTests = false;
  }

  // Book Follow Up
  openPopupBookFollowUp() {
    this.bookFollowUp = true;
  }

  closeBookFollowUp() {
    this.bookFollowUp = false;
  }
}
