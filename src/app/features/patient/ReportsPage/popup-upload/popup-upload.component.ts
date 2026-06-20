import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PatientReportsService } from '../../service/patient-reports.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-popup-upload',
  imports: [CommonModule],
  templateUrl: './popup-upload.component.html',
})
export class PopupUploadComponent {
  @Input() title: string = '';

  @Input() selectedId: number | null = null;
  @Output() close = new EventEmitter<void>();
  // @Output() sendFiles = new EventEmitter<File[]>();

  uploadedFiles: File[] = [];

  constructor(
    private prescriptionServices: PatientReportsService,
    private toastr: ToastrService,
  ) {}

  closePopup() {
    this.close.emit();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files) return;

    const files = Array.from(input.files);

    files.forEach((file) => {
      const exists = this.uploadedFiles.some(
        (f) => f.name === file.name && f.size === file.size,
      );

      if (!exists) {
        this.uploadedFiles.push(file);
      }
    });

    input.value = '';
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();

    if (!event.dataTransfer?.files) return;

    const files = Array.from(event.dataTransfer.files);

    files.forEach((file) => {
      const exists = this.uploadedFiles.some(
        (f) => f.name === file.name && f.size === file.size,
      );

      if (!exists) {
        this.uploadedFiles.push(file);
      }
    });
  }

  viewFile(file: File) {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
  }

  removeFile(file: File) {
    this.uploadedFiles = this.uploadedFiles.filter((f) => f !== file);
  }

  onSend() {
    console.log('testEmit called');
    console.log(this.selectedId);
    console.log(this.uploadedFiles);

    const formData = new FormData();

    if (this.title === 'labTest') {
      formData.append('LabAnalysisRequestId', String(this.selectedId));
    } else {
      formData.append(
        'radiologicalExaminationRequestId',
        String(this.selectedId),
      );
    }

    this.uploadedFiles.forEach((file: File) => {
      formData.append('Files', file);
    });
    if (this.title === 'labTest') {
      this.prescriptionServices.sendLabTestForDoctor(formData).subscribe({
        next: (res: any) => {
          console.log('Upload success:', res);
          this.toastr.success('Files uploaded successfully!');
          this.closePopup();
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
    } else {
      this.prescriptionServices.sendRadiologyForDoctor(formData).subscribe({
        next: (res: any) => {
          console.log('Upload success:', res);
          this.toastr.success('Files uploaded successfully!');
          this.closePopup();
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
  }
}
