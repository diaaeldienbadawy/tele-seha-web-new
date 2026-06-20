import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Select } from 'primeng/select';
import { PatientAuthService } from '../../service/patient-auth.service';
import { Router } from '@angular/router';
import { SpecialtiesService } from '../../../../shared/services/specialties.service';
import { GlobalUserStateService } from '../../../../core/services/state/global-user-state.service';
import { PatientRegistrationStateService } from '../../../../core/services/state/patient-registration-state.service';
import { PatientService } from '../../../../shared/services/patient.service';
import { PatientRegistrationListsStateService } from '../../../../core/services/state/patient-registration-lists-state.service';

import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-info-about-you',
  imports: [ReactiveFormsModule, Select, CommonModule, TranslateModule],
  templateUrl: './info-about-you.component.html',
  styleUrl: './info-about-you.component.css',
})
export class InfoAboutYouComponent implements OnInit {
  basicInfoForm!: FormGroup;

  patientId: string | null = null;
  countries: any[] = [];
  states: any[] = [];
  cities: string[] = [];

  maritalStatus: string[] = [];
  jobTitles: string[] = [];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private patientAuthService: PatientAuthService,
    private route: Router,
    private globalUserStateService: GlobalUserStateService,
    private patientRegistrationStateService: PatientRegistrationStateService,
    private patientService: PatientService,
    private listsStateService: PatientRegistrationListsStateService,
  ) {
    this.patientId = this.globalUserStateService.loggedInPatientId() || this.globalUserStateService.patientId() || this.patientRegistrationStateService.patientId() || null;
  }

  ngOnInit(): void {
    this.initForm();
    this.listenToChanges();
    
    // Assign from lists state service
    this.countries = this.listsStateService.countries();
    this.maritalStatus = this.listsStateService.maritalStatus();
    this.jobTitles = this.listsStateService.jobTitles();

    if (this.patientId) {
      this.loadExistingData();
    }
  }

  loadExistingData() {
    this.patientService.getPatientProfile(Number(this.patientId)).subscribe({
      next: (data: any) => {
        if (data) {
          this.basicInfoForm.patchValue({
            Country: data.countryId || data.country || '',
          });

          if (data.countryId || data.country) {
            const countryId = data.countryId || data.country;
            const country = this.countries.find((c) => c.countryId === countryId);
            this.states = country?.states || [];
          }

          this.basicInfoForm.patchValue({
            State: data.stateId || data.state || '',
          });

          if (data.stateId || data.state) {
            const stateId = data.stateId || data.state;
            const state = this.states.find((s) => s.stateId === stateId);
            this.cities = state?.cities || [];
          }

          this.basicInfoForm.patchValue({
            City: data.city || '',
            MaritalStatus: data.maritalStatus || '',
            JobTitle: data.jobTitle || '',
            Height: data.height || '',
            Weight: data.weight || '',
          });
        }
      },
      error: (err) => {
        // error handling can go here
      }
    });
  }

  /* =======================
     FORM
  ======================= */
  initForm() {
    this.basicInfoForm = this.fb.group({
      Country: ['', Validators.required], // countryId
      State: ['', Validators.required], // stateId
      City: ['', Validators.required], // city name
      MaritalStatus: ['', Validators.required],
      JobTitle: ['', Validators.required],
      Height: ['', Validators.required],
      Weight: ['', Validators.required],
    });
  }

  /* =======================
     LOAD LISTS
  ======================= */
  // Replaced by loadAllData

  /* =======================
     LISTEN TO DROPDOWNS
  ======================= */
  listenToChanges() {
    // Country change
    this.basicInfoForm.get('Country')?.valueChanges.subscribe((countryId) => {
      const country = this.countries.find((c) => c.countryId === countryId);
      this.states = country ? country.states : [];
      this.cities = [];

      this.basicInfoForm.patchValue({
        State: '',
        City: '',
      });
    });

    // State change
    this.basicInfoForm.get('State')?.valueChanges.subscribe((stateId) => {
      const state = this.states.find((s) => s.stateId === stateId);
      this.cities = state ? state.cities : [];

      this.basicInfoForm.patchValue({
        City: '',
      });
    });
  }

  /* =======================
     BUILD FORM DATA (STRINGS)
  ======================= */
  private buildFormData(): FormData {
    const formValue = this.basicInfoForm.value;

    const country = this.countries.find(
      (c) => c.countryId === formValue.Country,
    );

    const state = this.states.find((s) => s.stateId === formValue.State);

    const formData = new FormData();

    formData.append('Country', country?.countryName ?? '');
    formData.append('State', state?.stateName ?? '');
    formData.append('City', formValue.City);
    formData.append('MaritalStatus', formValue.MaritalStatus);
    formData.append('JobTitle', formValue.JobTitle);
    formData.append('Height', String(Number(formValue.Height)));
    formData.append('Weight', String(Number(formValue.Weight)));

    return formData;
  }

  /* =======================
     SAVE
  ======================= */
  save() {
    if (this.basicInfoForm.invalid) {
      this.toastr.error('Please fill all fields');
      return;
    }

    const formData = this.buildFormData();

    this.patientAuthService
      .completeProfilePatient(formData, Number(this.patientId))
      .subscribe({
        next: (res) => {
          this.toastr.success('Profile completed successfully');
          this.route.navigate(['/patient/home']);
          this.basicInfoForm.reset();
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

  goBack() {
    this.route.navigate(['/patient/auth/register/medical-history'], { queryParams: { from: 'info-about-you' } });
  }

  clearLocalStorage() {
    this.globalUserStateService.clearUserData();
    this.patientRegistrationStateService.clearRegistrationData();
    localStorage.clear();
    this.route.navigate(['/']);
  }
}
