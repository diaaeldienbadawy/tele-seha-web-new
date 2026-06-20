import { Component } from '@angular/core';
import { AuthLogoComponent } from '../../../../shared/components/auth-logo/auth-logo.component';
import { AuthLeftSideComponent } from '../../../../shared/components/auth-left-side/auth-left-side.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,

} from '@angular/forms';
import { Select } from 'primeng/select';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { INextStepEnum } from '../../../../core/models/nextStepEnum';
import { GlobalUserStateService } from '../../../../core/services/state/global-user-state.service';
import { DoctorRegistrationStateService } from '../../../../core/services/state/doctor-registration-state.service';
import { SpecialtiesService } from '../../../../shared/services/specialties.service';
import { DoctorAuthService } from '../../service/doctor-auth.service';

@Component({
  selector: 'app-doctor-register-step3',
  imports: [
    AuthLogoComponent,
    AuthLeftSideComponent,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './doctor-register-step3.component.html',
  styleUrl: './doctor-register-step3.component.css',
})
export class DoctorRegisterStep3Component {
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

  basicInfoForm!: FormGroup;
  
  isLoading: boolean = false;
  isEditMode: boolean = false;
  doctorId: any = null;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private doctorAuthService: DoctorAuthService,
    private route: Router,
    private globalUserStateService: GlobalUserStateService,
    private doctorRegistrationStateService: DoctorRegistrationStateService,
  ) {}

  ngOnInit(): void {
    this.doctorId = this.globalUserStateService.doctorId() || this.doctorRegistrationStateService.doctorId();
    this.initForm();
    if (this.doctorId) {
      this.loadExistingData();
    }
  }

  loadExistingData() {
    this.doctorAuthService.getDoctorCertificateById(this.doctorId).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.isEditMode = true;
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
          if (data.bachelorCerificate) {
            this.BachelorCerificate = 'Already Uploaded';
            this.previewUrlBachelorCerificate = data.bachelorCerificate;
          }
          if (data.exelenceCertificate) {
            this.ExelenceCertificate = 'Already Uploaded';
            this.previewUrlExelenceCertificate = data.exelenceCertificate;
          }
          if (data.medicalSyndicateId) {
            this.MedicalSyndicateId = 'Already Uploaded';
            this.previewUrlMedicalSyndicateId = data.medicalSyndicateId;
          }
          if (data.medicalLicense) {
            this.MedicalLicense = 'Already Uploaded';
            this.previewUrlMedicalLicense = data.medicalLicense;
          }
        }
      },
      error: () => {}
    });
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

  /* ================= SINGLE FILES ================= */

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

  /* ================= MULTI FILE FIX ================= */

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
      (f) => f.name,
    );

    this.basicInfoForm.patchValue({
      OtherCertificates: this.selectedOtherCertificates.length
        ? this.selectedOtherCertificates
        : null,
    });
  }

  /* ================= SAVE ================= */

  save() {
    const doctorId = this.doctorId || this.globalUserStateService.doctorId() || this.doctorRegistrationStateService.doctorId();

    this.basicInfoForm.get('DoctorId')?.setValue(doctorId);

    // Clear previous server errors to allow retry
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

    formData.append('Id', String(doctorId));

    this.isLoading = true;

    if (this.isEditMode && this.doctorId) {
      this.doctorAuthService.updateDoctorCertificate(this.doctorId, formData).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.toastr.success('Certificates updated successfully');
          this.globalUserStateService.hydrateNextStep('WaitForAcctivation');
          this.route.navigate(['doctor/auth/watingForAcctivation'], { replaceUrl: true });
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
              } else if (key.startsWith('OtherCertificates')) {
                const otherControl = this.basicInfoForm.get('OtherCertificates');
                if (otherControl) {
                  otherControl.setErrors({ serverError: apiErrors[key][0] });
                  otherControl.markAsTouched();
                }
              }
            });
          } else if (err?.error?.message || err?.error?.Message) {
            this.toastr.error(err.error.message || err.error.Message, 'Error');
          } else {
            this.toastr.error('An unexpected error occurred.', 'Error');
          }
        }
      });
    } else {
      this.doctorAuthService.doctorCertificate(formData).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.globalUserStateService.hydrateNextStep('WaitForAcctivation');
          this.route.navigate(['doctor/auth/watingForAcctivation'], { replaceUrl: true });
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
              } else if (key.startsWith('OtherCertificates')) {
                const otherControl = this.basicInfoForm.get('OtherCertificates');
                if (otherControl) {
                  otherControl.setErrors({ serverError: apiErrors[key][0] });
                  otherControl.markAsTouched();
                }
              }
            });
          } else if (err?.error?.message || err?.error?.Message) {
            this.toastr.error(err.error.message || err.error.Message, 'Error');
          } else {
            this.toastr.error('An unexpected error occurred.', 'Error');
          }
        }
      });
    }
  }

  clearLocalStorage() {
    this.globalUserStateService.clearUserData();
    this.doctorRegistrationStateService.clearRegistrationData();
    this.route.navigate(['/'], { replaceUrl: true });
  }

  isImage(url: string | null): boolean {
    if (!url) return false;
    if (url.startsWith('data:image')) return true;
    if (url.startsWith('data:application/pdf')) return false;
    return !url.toLowerCase().endsWith('.pdf');
  }
}
