import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { PatientService } from '../../../../shared/services/patient.service';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-send-symptoms-section',
  imports: [CommonModule, FormsModule],
  templateUrl: './send-symptoms-section.component.html',
  styleUrl: './send-symptoms-section.component.css',
})
export class SendSymptomsSectionComponent {
  @Output() close = new EventEmitter<void>();

  text!: string;

  patientId: string | null = null;
  constructor(
    readonly patientService: PatientService,
    readonly localStorageService: LocalstorageService,
    readonly toastr: ToastrService,
  ) {
    this.patientId = this.localStorageService.loggedInPatientId() || null;
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

  send() {
    if (!this.text?.trim()) {
      this.toastr.error('برجاء كتابة الأعراض أولاً.');
      return;
    }
    if (this.patientId) {
      this.patientService.receiption(+this.patientId, this.text).subscribe({
        next: () => {
          this.sendForm = false;
          this.payNow = true;
        },
        error: (err) => {
          // الخطأ كان بيتبلع في الكونسول والمريض فاكر إن حاجة بتحصل.
          const apiError = err?.error;
          this.toastr.error(
            apiError?.message ||
              (typeof apiError === 'string' && apiError ? apiError : 'تعذر إرسال الأعراض، حاول مرة أخرى.'),
          );
        },
      });
    }
  }
}
