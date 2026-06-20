import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { AuthLogoComponent } from '../../../../shared/components/auth-logo/auth-logo.component';
import { AuthLeftSideComponent } from '../../../../shared/components/auth-left-side/auth-left-side.component';
import { DoctorRegistrationListsStateService } from '../../../../core/services/state/doctor-registration-lists-state.service';
import { Router, RouterLink } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { INextStepEnum } from '../../../../core/models/nextStepEnum';
import { GlobalUserStateService } from '../../../../core/services/state/global-user-state.service';
import { DoctorRegistrationStateService } from '../../../../core/services/state/doctor-registration-state.service';
import { SpecialtiesService } from '../../../../shared/services/specialties.service';
import { DoctorAuthService } from '../../service/doctor-auth.service';
import { Select } from 'primeng/select';
import { PatientAuthService } from '../../../patient/service/patient-auth.service';
import { DatePickerModule } from 'primeng/datepicker';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-doctor-register-step2',
  imports: [
    AuthLogoComponent,
    AuthLeftSideComponent,
    RouterLink,
    Select,
    ReactiveFormsModule,
    DatePickerModule,
  ],
  templateUrl: './doctor-register-step2.component.html',
  styleUrl: './doctor-register-step2.component.css',
})
export class DoctorRegisterStep2Component implements OnInit {
  private destroyRef = inject(DestroyRef);
  
  fileName: string = '';
  selectedImage!: File;
  previewUrl: string | null = null;

  maxBirthDate: Date = new Date(new Date().getFullYear() - 23, 11, 31);
  countries: any[] = [];
  states: any[] = [];
  cities: string[] = [];

  genders = [
    { name: 'Male', code: true },
    { name: 'Female', code: false },
  ];

  University: any[] = [];

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
    private patientAuthService: PatientAuthService,
    private listsStateService: DoctorRegistrationListsStateService,
  ) {}

  ngOnInit(): void {
    this.doctorId = this.globalUserStateService.doctorId() || this.doctorRegistrationStateService.doctorId();
    this.initForm();
    this.listenToChanges();
    
    // Assign from lists state service
    this.countries = this.listsStateService.countries();
    this.University = this.listsStateService.universities();

    if (this.doctorId) {
      this.loadExistingData();
    }
  }

  loadExistingData() {
    this.isLoading = true;
    this.doctorAuthService.getDoctorProfileById(this.doctorId).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.isEditMode = true;
          const data = res.data;

          const countryName = data.country || '';
          this.basicInfoForm.patchValue({
            Description: data.description || '',
            Country: countryName,
          });
          
          if (countryName || data.countryId) {
            const country = this.countries.find((c) => c.countryName === countryName || c.countryId === data.countryId);
            this.states = country?.states || [];
          }
          
          const stateName = data.state || '';
          this.basicInfoForm.patchValue({
            State: stateName,
          });

          if (stateName || data.stateId) {
            const state = this.states.find((s) => s.stateName === stateName || s.stateId === data.stateId);
            this.cities = state?.cities || [];
          }

          this.basicInfoForm.patchValue({
            City: data.city || '',
            BirthDate: data.birthDate ? new Date(data.birthDate) : '',
            IsMale: data.isMale !== undefined ? data.isMale : null,
          });

          if (data.imageUrl) {
            this.fileName = 'Current Image Uploaded';
            this.previewUrl = data.imageUrl;
          }

          if (data.universityEn && this.University.length > 0) {
            const matchedUni = this.University.find((u: any) => u.universityNameEn === data.universityEn || u.universityName === data.universityEn);
            if (matchedUni) {
              this.basicInfoForm.patchValue({ University: matchedUni });
            }
          }
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  initForm() {
    this.basicInfoForm = this.fb.group({
      Description: [''],
      Image: [null],

      Country: [''],
      State: [''],
      City: [''],

      BirthDate: ['', Validators.required],
      IsMale: [null, Validators.required],

      University: ['', Validators.required],

      DoctorId: [null],
    });
  }

  listenToChanges() {
    // Country change
    this.basicInfoForm.get('Country')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((countryName) => {
      const country = this.countries.find((c) => c.countryName === countryName);

      this.states = country?.states || [];
      this.cities = [];

      this.basicInfoForm.patchValue({
        State: '',
        City: '',
      });
    });

    // State change
    this.basicInfoForm.get('State')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((stateName) => {
      const state = this.states.find((s) => s.stateName === stateName);

      this.cities = state?.cities || [];

      this.basicInfoForm.patchValue({
        City: '',
      });
    });
  }

  /* ================= FILE ================= */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (file.size > 2 * 1024 * 1024) {
        this.toastr.error('حجم الصورة لا يجب أن يتجاوز 2 ميجابايت.');
        input.value = '';
        return;
      }

      this.selectedImage = file;
      this.fileName = file.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);

      this.basicInfoForm.patchValue({
        Image: file,
      });

      this.basicInfoForm.get('Image')?.updateValueAndValidity();
    }
  }

  /* ================= SAVE ================= */
  save() {
    const doctorId = this.doctorId;

    this.basicInfoForm.get('DoctorId')?.setValue(doctorId);

    if (this.basicInfoForm.invalid) {
      this.basicInfoForm.markAllAsTouched();
      return;
    }

    const formValue = this.basicInfoForm.value;

    const formData = new FormData();

    formData.append('Description', formValue.Description || '');
    
    if (this.selectedImage) {
      formData.append('Image', this.selectedImage);
    }

    formData.append('Country', formValue.Country || '');
    formData.append('State', formValue.State || '');

    formData.append('City', formValue.City || '');
    
    if (formValue.IsMale !== null && formValue.IsMale !== undefined) {
      formData.append('IsMale', String(formValue.IsMale));
    }

    const date = new Date(formValue.BirthDate).toLocaleDateString('en-US');
    formData.append('BirthDate', date);

    const university = formValue.University;

    if (university) {
      formData.append('UniversityAr', university.universityName);
      formData.append('UniversityEn', university.universityNameEn);
    }

    formData.append('Id', String(doctorId));

    this.isLoading = true;

    if (this.isEditMode && this.doctorId) {
      this.doctorAuthService.updateDoctorProfile(this.doctorId, formData).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.toastr.success('Profile updated successfully');

          if (res?.nextStep) {
            this.globalUserStateService.hydrateNextStep(res.nextStep);
          }

          this.route.navigate(['doctor/auth/register/createCertificates'], { replaceUrl: true });
        },
        error: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.doctorAuthService.doctorProfile(formData).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res?.nextStep) {
            this.globalUserStateService.hydrateNextStep(res.nextStep);
          }

          this.route.navigate(['doctor/auth/register/createCertificates'], { replaceUrl: true });
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }

  clearLocalStorage() {
    this.globalUserStateService.clearUserData();
    this.doctorRegistrationStateService.clearRegistrationData();
    this.route.navigate(['/'], { replaceUrl: true });
  }
}
