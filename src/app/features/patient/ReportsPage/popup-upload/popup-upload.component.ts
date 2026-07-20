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
  /** بينطلق بعد نجاح الرفع — الأب بيعيد تحميل اللستة عشان "النتائج المرسلة" تظهر فورًا. */
  @Output() uploaded = new EventEmitter<void>();

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

  private static readonly MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
  private static readonly ALLOWED_TYPES = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
  ];

  onSend() {
    // Validate before hitting the server: a request id must exist, at least one file must be
    // chosen, and each file must be an allowed type within the size limit.
    if (!this.selectedId) {
      this.toastr.error('لا يوجد طلب مرتبط بهذا الرفع.');
      return;
    }
    if (!this.uploadedFiles.length) {
      this.toastr.error('اختر ملفًا واحدًا على الأقل.');
      return;
    }
    const invalid = this.uploadedFiles.find(
      (f) =>
        f.size > PopupUploadComponent.MAX_FILE_BYTES ||
        !PopupUploadComponent.ALLOWED_TYPES.includes(f.type),
    );
    if (invalid) {
      this.toastr.error('الملفات المسموحة: PDF أو صور، وبحد أقصى 10 ميجابايت للملف.');
      return;
    }

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
        next: () => {
          this.toastr.success('تم رفع الملفات بنجاح.');
          this.uploaded.emit();
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
        next: () => {
          this.toastr.success('تم رفع الملفات بنجاح.');
          this.uploaded.emit();
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
