import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LocalstorageService } from '../../../../../core/services/localstorage.service';
import { PatientService } from '../../../../../shared/services/patient.service';
import { FormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-patient-symptoms-section',
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  templateUrl: './patient-symptoms-section.component.html',
  styleUrl: './patient-symptoms-section.component.css',
})
export class PatientSymptomsSectionComponent {
  @Output() close = new EventEmitter<void>();

  text!: string;

  patientId: number | null = null;
  constructor(
    readonly patientService: PatientService,
    readonly localStorageService: LocalstorageService,
    readonly toastr: ToastrService,
  ) {
    this.patientId = Number(this.localStorageService.get('patientId')) || null;
  }

  onClose() {
    this.close.emit();
  }

  sendForm: boolean = true;
  payNow: boolean = false;
  result: boolean = false;

  closePayNow() {
    this.payNow = false;
    this.result = true;
  }

  speciality: any ;
  send() {
    console.log(this.patientId);
    console.log(this.text);

    if (!this.text) {
      this.toastr.error('Please enter your symptoms before sending.');
      return;
    };

    if (this.patientId) {
      this.patientService.receiption(this.patientId, this.text).subscribe({
        next: (res : any) => {
          console.log(res);
          this.speciality = res.speciality;
          this.sendForm = false;
          this.payNow = true;
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }
}
