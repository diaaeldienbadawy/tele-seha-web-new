import { Component, OnInit, signal } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LocalstorageService } from '../../../../../core/services/localstorage.service';
import { CommonModule } from '@angular/common';
import { DoctorAuthService } from '../../../service/doctor-auth.service';

@Component({
  selector: 'app-certificates-info',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './certificates-info.component.html',
  styleUrl: './certificates-info.component.css',
})
export class CertificatesInfoComponent implements OnInit {
  basicInfoForm!: FormGroup;
  showBtnSave = signal<boolean>(false);
  doctorId: any;

  NationalIdFrontUrl = '';
  selectedNationalIdFrontUrl!: File;

  NationalIdBackUrl = '';
  selectedNationalIdBackUrl!: File;

  BachelorCerificate = '';
  selectedBachelorCerificate!: File;

  ExelenceCertificate = '';
  selectedExelenceCertificate!: File;

  MedicalSyndicateId = '';
  selectedMedicalSyndicateId!: File;

  MedicalLicense = '';
  selectedMedicalLicense!: File;

  previewUrlNationalIdFrontUrl: string | null = null;
  previewUrlNationalIdBackUrl: string | null = null;
  previewUrlBachelorCerificate: string | null = null;
  previewUrlExelenceCertificate: string | null = null;
  previewUrlMedicalSyndicateId: string | null = null;
  previewUrlMedicalLicense: string | null = null;

  selectedOtherCertificates: File[] = [];
  otherCertificatesNames: string[] = [];
  previewUrlOtherCertificates: string[] = [];
  existingOtherCertificates: string[] = [];

  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private doctorAuthService: DoctorAuthService,
    private localStorageService: LocalstorageService
  ) {
    this.doctorId = this.localStorageService.get('doctorId');
  }

  ngOnInit(): void {
    this.initForm();
    this.loadDoctorCertificates();
  }

  initForm() {
    this.basicInfoForm = this.fb.group({
      NationalIdFrontUrl: [null, Validators.required],
      NationalIdBackUrl: [null, Validators.required],
      BachelorCerificate: [null, Validators.required],
      ExelenceCertificate: [null, Validators.required],
      MedicalSyndicateId: [null, Validators.required],
      MedicalLicense: [null],
      OtherCertificates: [null],
      DoctorId: [null],
    });
  }

  loadDoctorCertificates() {
    this.doctorAuthService.getDoctorCertificateById(this.doctorId).subscribe({
      next: (res) => {
        if (res && res.data) {
          const data = res.data;

          this.basicInfoForm.get('NationalIdFrontUrl')?.clearValidators();
          this.basicInfoForm.get('NationalIdBackUrl')?.clearValidators();
          this.basicInfoForm.get('BachelorCerificate')?.clearValidators();
          this.basicInfoForm.get('ExelenceCertificate')?.clearValidators();
          this.basicInfoForm.get('MedicalSyndicateId')?.clearValidators();

          this.basicInfoForm.get('NationalIdFrontUrl')?.updateValueAndValidity();
          this.basicInfoForm.get('NationalIdBackUrl')?.updateValueAndValidity();
          this.basicInfoForm.get('BachelorCerificate')?.updateValueAndValidity();
          this.basicInfoForm.get('ExelenceCertificate')?.updateValueAndValidity();
          this.basicInfoForm.get('MedicalSyndicateId')?.updateValueAndValidity();

          if (data.nationalIdFrontUrl) {
            this.NationalIdFrontUrl = 'Already Uploaded';
            this.previewUrlNationalIdFrontUrl = data.nationalIdFrontUrl;
          }
          if (data.nationalIdBackUrl) {
            this.NationalIdBackUrl = 'Already Uploaded';
            this.previewUrlNationalIdBackUrl = data.nationalIdBackUrl;
          }
          if (data.bachelorCerificateUrl) {
            this.BachelorCerificate = 'Already Uploaded';
            this.previewUrlBachelorCerificate = data.bachelorCerificateUrl;
          }
          if (data.internshipCertificateUrl) {
            this.ExelenceCertificate = 'Already Uploaded';
            this.previewUrlExelenceCertificate = data.internshipCertificateUrl;
          }
          if (data.medicalSyndicateIdUrl) {
            this.MedicalSyndicateId = 'Already Uploaded';
            this.previewUrlMedicalSyndicateId = data.medicalSyndicateIdUrl;
          }
          if (data.medicalLicenseUrl) {
            this.MedicalLicense = 'Already Uploaded';
            this.previewUrlMedicalLicense = data.medicalLicenseUrl;
          }
          this.existingOtherCertificates = data.otherCerificateUrls || [];
        }
        this.basicInfoForm.disable();
      },
      error: () => {
        this.toastr.error('Failed to load certificates');
        this.basicInfoForm.disable();
      }
    });
  }

  onFileSelectedNationalId(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedNationalIdFrontUrl = file;
    this.NationalIdFrontUrl = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrlNationalIdFrontUrl = reader.result as string;
    };
    reader.readAsDataURL(file);

    this.basicInfoForm.patchValue({ NationalIdFrontUrl: file });
  }

  onFileSelectedNationalIdBackUrl(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedNationalIdBackUrl = file;
    this.NationalIdBackUrl = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrlNationalIdBackUrl = reader.result as string;
    };
    reader.readAsDataURL(file);

    this.basicInfoForm.patchValue({ NationalIdBackUrl: file });
  }

  onFileSelectedBachelorCerificate(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedBachelorCerificate = file;
    this.BachelorCerificate = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrlBachelorCerificate = reader.result as string;
    };
    reader.readAsDataURL(file);

    this.basicInfoForm.patchValue({ BachelorCerificate: file });
  }

  onFileSelectedExelenceCertificate(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedExelenceCertificate = file;
    this.ExelenceCertificate = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrlExelenceCertificate = reader.result as string;
    };
    reader.readAsDataURL(file);

    this.basicInfoForm.patchValue({ ExelenceCertificate: file });
  }

  onFileSelectedMedicalSyndicateId(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedMedicalSyndicateId = file;
    this.MedicalSyndicateId = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrlMedicalSyndicateId = reader.result as string;
    };
    reader.readAsDataURL(file);

    this.basicInfoForm.patchValue({ MedicalSyndicateId: file });
  }

  onFileSelectedMedicalLicense(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedMedicalLicense = file;
    this.MedicalLicense = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrlMedicalLicense = reader.result as string;
    };
    reader.readAsDataURL(file);

    this.basicInfoForm.patchValue({ MedicalLicense: file });
  }

  onFileSelectedOtherCertificates(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files) as File[];

    this.selectedOtherCertificates = [
      ...this.selectedOtherCertificates,
      ...files,
    ];

    files.forEach((file, index) => {
      const newIndex = this.selectedOtherCertificates.length - files.length + index;
      this.previewUrlOtherCertificates[newIndex] = ''; 
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrlOtherCertificates[newIndex] = reader.result as string;
      };
      reader.readAsDataURL(file);
    });

    this.syncOtherCertificates();
    input.value = '';
  }

  removeOtherCertificate(index: number) {
    this.selectedOtherCertificates.splice(index, 1);
    this.previewUrlOtherCertificates.splice(index, 1);
    this.syncOtherCertificates();
  }

  syncOtherCertificates() {
    this.otherCertificatesNames = this.selectedOtherCertificates.map(
      (f) => f.name
    );

    this.basicInfoForm.patchValue({
      OtherCertificates: this.selectedOtherCertificates.length
        ? this.selectedOtherCertificates
        : null,
    });
  }

  getFileName(url: string): string {
    if (!url) return '';
    const parts = url.split('/');
    const fullName = parts[parts.length - 1];
    try {
      return decodeURIComponent(fullName);
    } catch {
      return fullName;
    }
  }

  removeExistingOtherCertificate(index: number) {
    this.existingOtherCertificates.splice(index, 1);
  }

  save() {
    // Clear server errors
    Object.keys(this.basicInfoForm.controls).forEach(key => {
      const control = this.basicInfoForm.get(key);
      if (control && control.errors) {
        const errors = { ...control.errors };
        delete errors['serverError'];
        control.setErrors(Object.keys(errors).length ? errors : null);
      }
    });

    if (this.basicInfoForm.invalid) {
      this.basicInfoForm.markAllAsTouched();
      this.toastr.error('Please upload all required documents', 'Validation Error');
      return;
    }

    const formData = new FormData();
    if (this.selectedNationalIdFrontUrl) formData.append('NationalIdFrontUrl', this.selectedNationalIdFrontUrl);
    if (this.selectedNationalIdBackUrl) formData.append('NationalIdBackUrl', this.selectedNationalIdBackUrl);
    if (this.selectedBachelorCerificate) formData.append('BachelorCerificate', this.selectedBachelorCerificate);
    if (this.selectedExelenceCertificate) formData.append('ExelenceCertificate', this.selectedExelenceCertificate);
    if (this.selectedMedicalSyndicateId) formData.append('MedicalSyndicateId', this.selectedMedicalSyndicateId);
    if (this.selectedMedicalLicense) formData.append('MedicalLicense', this.selectedMedicalLicense);

    this.selectedOtherCertificates.forEach((file) => {
      formData.append('OtherCertificates', file);
    });

    this.existingOtherCertificates.forEach((url) => {
      formData.append('existingOtherCertificates', url);
    });

    formData.append('Id', String(this.doctorId));
    this.isLoading = true;

    this.doctorAuthService.updateDoctorCertificate(this.doctorId, formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Certificates updated successfully');
        this.loadDoctorCertificates();
        this.showBtnSave.set(false);
        this.basicInfoForm.disable();
      },
      error: (err: any) => {
        this.isLoading = false;
        if (err?.error?.errors) {
          const apiErrors = err.error.errors;
          Object.keys(apiErrors).forEach(key => {
            apiErrors[key].forEach((msg: string) => {
              this.toastr.error(`${key}: ${msg}`, 'Error');
            });

            const control = this.basicInfoForm.get(key);
            if (control) {
              control.setErrors({ serverError: apiErrors[key][0] });
              control.markAsTouched();
            }
          });
        } else {
          this.toastr.error('Failed to update certificates');
        }
      }
    });
  }

  edit() {
    this.showBtnSave.set(true);
    this.basicInfoForm.enable();
  }

  cancel() {
    this.showBtnSave.set(false);
    this.basicInfoForm.disable();
    this.selectedOtherCertificates = [];
    this.previewUrlOtherCertificates = [];
    this.otherCertificatesNames = [];
    this.selectedNationalIdFrontUrl = undefined as any;
    this.selectedNationalIdBackUrl = undefined as any;
    this.selectedBachelorCerificate = undefined as any;
    this.selectedExelenceCertificate = undefined as any;
    this.selectedMedicalSyndicateId = undefined as any;
    this.selectedMedicalLicense = undefined as any;
    this.loadDoctorCertificates();
  }

  isImage(url: string | null): boolean {
    if (!url) return false;
    if (url.startsWith('data:image')) return true;
    if (url.startsWith('data:application/pdf')) return false;
    return !url.toLowerCase().endsWith('.pdf') && !url.includes('.pdf');
  }
}
