import { doctorGuard } from './../../../../core/guards/doctor.guard';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { PatientMeetingVideoCallComponent } from '../patient-meeting-video-call/patient-meeting-video-call.component';
import { PatientSendPictureVideoCallComponent } from '../patient-send-picture-video-call/patient-send-picture-video-call.component';
import { PatientChatVideoCallComponent } from '../patient-chat-video-call/patient-chat-video-call.component';
import { PatientService } from '../../../../shared/services/patient.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PatientVideoCallService } from '../../service/patient-video-call.service';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { ToastrService } from 'ngx-toastr';

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
  constructor(
    @Inject(PLATFORM_ID) readonly platformId: Object,
    readonly patientService: PatientService,
    readonly patientVideoCall: PatientVideoCallService,
    private localstorageService: LocalstorageService,
    readonly toastr: ToastrService,
    readonly fb: FormBuilder,
  ) {}
  ngOnInit() {
    this.meetingId = Number(this.localstorageService.get('meetingId'));
    if (this.meetingId) {
      this.getMettingDetails();
      this.getMeetingReports();
    }
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
      meeting_id: [this.meetingId],
      doctor_id: [doctorId || 0],
    });
  }

  getMettingDetails() {
    this.patientVideoCall.getMeetingDetails(this.meetingId).subscribe({
      next: (res) => {
        console.log(
          'sssssssssssssssssssssssssssssssssssssssssssssssssssss getMettingDetails:',
          res,
        );
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  getMeetingReports() {
    this.patientVideoCall.getMeetingReports(this.meetingId).subscribe({
      next: (res) => {
        this.meetingReport = res;
        this.currentSection = 0;
      },
      error: (err) => console.error(err),
    });
  }

  nextSection() {
    if (this.currentSection < 2) {
      this.currentSection++;
    } else {
      this.currentSection = 0; // loop back to first section if needed
    }
  }

  downloadPrescription() {
    const element = document.createElement('a');
    const content = this.generatePrescriptionText();
    const blob = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(blob);
    element.download = `Prescription_RX-${this.meetingReport?.prescription?.id || 'NotFound'}.txt`;
    element.click();
    URL.revokeObjectURL(element.href);
  }

  generatePrescriptionText(): string {
    let text = '--- Prescription ---\n\n';
    text += `Patient: ${this.agoraDetailsPatient?.patientName || 'Not Found'}\n`;
    text += `Doctor: ${this.agoraDetailsPatient?.doctor?.name || 'Not Found'}\n\n`;

    // Lab Analyses
    text += 'Lab Analyses:\n';
    if (this.meetingReport?.labAnalysisRequest?.labAnalyses?.length) {
      this.meetingReport.labAnalysisRequest.labAnalyses.forEach((lab: any) => {
        text += `- ${lab.name} (${lab.notes || 'No Notes'})\n`;
      });
    } else text += 'Not Found\n';

    // Radiology
    text += '\nRadiological Examinations:\n';
    if (
      this.meetingReport?.radiologicalExaminationRequest
        ?.radiologicalExaminations?.length
    ) {
      this.meetingReport.radiologicalExaminationRequest.radiologicalExaminations.forEach(
        (rad: any) => {
          text += `- ${rad.name} (${rad.notes || 'No Notes'})\n`;
        },
      );
    } else text += 'Not Found\n';

    // Prescription
    text += '\nMedicines:\n';
    if (this.meetingReport?.prescription?.medicines?.length) {
      this.meetingReport.prescription.medicines.forEach((med: any) => {
        text += `- ${med.name}: ${med.instructions}\n`;
      });
    } else text += 'Not Found\n';

    return text;
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
  }
  closePopupPrescription() {
    this.showPopupPrescription = false;
  }

  openshowPopupRating() {
    this.showPopupSessionSuccess = false;
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
      next: (res) => {
        console.log('Success', res);
        this.toastr.success('Review submitted successfully');
        this.getMeetingReports();
        this.showPopupRating = false;
        this.showPopupPrescription = true;
      },
      error: (err) => {
        const apiError = err?.error;

        if (apiError?.message) {
          this.toastr.error(apiError.message);
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
        }
      },
    });
  }

  onSessionEnded() {
    console.log("Session ended");

    this.showPopupSessionSuccess = true;
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
