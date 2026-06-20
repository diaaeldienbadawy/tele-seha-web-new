import { GlobalUserStateService } from '../../../../core/services/state/global-user-state.service';
import { PatientRegistrationStateService } from '../../../../core/services/state/patient-registration-state.service';
import { PatientAuthService } from './../../service/patient-auth.service';
import { PatientService } from '../../../../shared/services/patient.service';
import { Component, OnInit } from '@angular/core';
import { AuthLogoComponent } from '../../../../shared/components/auth-logo/auth-logo.component';
import { AuthLeftSideComponent } from '../../../../shared/components/auth-left-side/auth-left-side.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Select } from 'primeng/select';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-basic-info',
  imports: [
    AuthLogoComponent,
    AuthLeftSideComponent,
    Select,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    DatePickerModule,
    TranslateModule,
  ],
  templateUrl: './basic-info.component.html',
  styleUrl: './basic-info.component.css',
})
export class BasicInfoComponent implements OnInit {
  genders = [
    { labelKey: 'auth.male', name: 'Male', code: true },
    { labelKey: 'auth.female', name: 'Female', code: false },
  ];

  today: Date = new Date();
  maxBirthDate: Date = new Date();

  selectedGender: string = '';
  basicInfoForm!: FormGroup;

  isLoading: boolean = false;
  patientId: string | null = null;
  isEditMode: boolean = false;

  constructor(
    readonly fb: FormBuilder,
    readonly patientAuthService: PatientAuthService,
    readonly route: Router,
    readonly toastr: ToastrService,
    readonly globalUserStateService: GlobalUserStateService,
    readonly patientRegistrationStateService: PatientRegistrationStateService,
    readonly patientService: PatientService,
  ) {
    this.patientId = this.globalUserStateService.loggedInPatientId() || this.globalUserStateService.patientId() || this.patientRegistrationStateService.patientId() || null;
  }

  ngOnInit(): void {
    const today = new Date();
    this.maxBirthDate = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
    this.initForm();
    if (this.patientId) {
      this.loadExistingData();
    }
  }

  loadExistingData() {
    this.isLoading = true;
    this.patientService.getPatientProfile(Number(this.patientId)).subscribe({
      next: (res: any) => {
        if (res) {
          this.isEditMode = true;
          this.basicInfoForm.patchValue({
            Name: res.name || '',
            IsMale: res.isMale !== undefined ? res.isMale : '',
            BirthDate: res.birthDate ? new Date(res.birthDate) : '',
          });
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
      Name: ['', [Validators.required]],
      IsMale: ['', [Validators.required]],
      BirthDate: [this.maxBirthDate, [Validators.required, this.ageValidator.bind(this)]],
    });
  }

  ageValidator(control: any) {
    if (!control.value) return null;
    const birthDate = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 10 ? null : { underAge: true };
  }

  setGender(isMale: boolean) {
    this.basicInfoForm.patchValue({ IsMale: isMale });
    this.basicInfoForm.get('IsMale')?.markAsTouched();
  }

  save() {
    if (this.basicInfoForm.invalid) {
      this.basicInfoForm.markAllAsTouched();
      return;
    }

    const birthDateValue = this.basicInfoForm.value.BirthDate;
    const date = birthDateValue instanceof Date 
      ? birthDateValue.toLocaleDateString('en-US') 
      : birthDateValue;
      
    this.basicInfoForm.get('BirthDate')?.setValue(date);

    this.isLoading = true;

    // We can use the same endpoint or update profile endpoint if in edit mode.
    // patientAuthService.basicInfo acts as create/update based on patient id or device key,
    // actually let's see if there's an update. The basicInfo passes deviceKey. 
    // It's safer to just use basicInfo as it might handle both or we should use updatePatientProfile if edit mode?
    // The user's goal is that if they started and come back, it fetches and they can save.
    // The previous implementation for doctor used update when isEditMode. But PatientAuthService only has basicInfo().
    // Wait, let's look at what we have for Patient:
    // patientAuthService.basicInfo() is a POST to /api/patient
    // patientService.updatePatientProfile is PUT to /api/patient/${patientId}
    
    if (this.isEditMode && this.patientId) {
      this.patientService.updatePatientProfile(Number(this.patientId), this.basicInfoForm.value).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          // After update, basicInfo might need to navigate next
          this.route.navigate(['patient/auth/register/medical-history'], { replaceUrl: true });
        },
        error: () => {
          this.isLoading = false;
        },
      });
    } else {
      this.patientAuthService.basicInfo(this.basicInfoForm.value).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.patientRegistrationStateService.setPatientName(res.data.name);
          this.patientRegistrationStateService.setPatientId(res.data.patientId);
          this.route.navigate(['patient/auth/register/medical-history'], { replaceUrl: true });
        },
        error: () => {
          this.isLoading = false;
        },
      });
    }
  }

  clearLocalStorage() {
    this.globalUserStateService.clearUserData();
    this.patientRegistrationStateService.clearRegistrationData();
    this.route.navigate(['/'], { replaceUrl: true });
  }
}
