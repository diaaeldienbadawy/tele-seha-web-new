import { Component, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PatientAuthService } from '../../service/patient-auth.service';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { ToastrService } from 'ngx-toastr';
import { Select } from 'primeng/select';
import { PatientService } from '../../../../shared/services/patient.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-patient-profile',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, Select, TranslateModule],
  templateUrl: './patient-profile.component.html',
  styleUrl: './patient-profile.component.css',
})
export class PatientProfileComponent implements OnInit {
  checked: boolean = false;

  showBtnSave = signal<boolean>(false);

  profileForm!: FormGroup;

  countries: any[] = [];
  states: any[] = [];
  cities: string[] = [];

  maritalStatus: string[] = [];
  jobTitles: string[] = [];

  patientId: string | null = null;

  constructor(
    readonly fb: FormBuilder,
    readonly patientAuthService: PatientAuthService,
    readonly patientService: PatientService,
    readonly localStorageService: LocalstorageService,
    readonly toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.patientId = this.localStorageService.loggedInPatientId() || null;
    this.initForm();
    this.listenToChanges();
    this.loadAllData();
  }

  dataProfile: any;

  loadAllData() {
    this.patientAuthService.getInfoLists().subscribe({
      next: (res) => {
        this.countries = res.countries || [];
        this.maritalStatus = res.maritalStatus || [];
        const rawJobs = res.jobTitles || res.jobTitle || [];
        this.jobTitles = rawJobs.map((item: any) => {
          if (typeof item === 'string') return item;
          return item.titleAr || item.titleEn || item.nameAr || item.nameEn || item.name || item.title || '';
        }).filter(Boolean);

        this.loadPatientDetails();
      },
      error: () => {
        this.toastr.error('Failed to load info lists');
      },
    });
  }

  loadPatientDetails() {
    if (!this.patientId) return;
    this.patientService.getPatientProfile(Number(this.patientId)).subscribe({
      next: (res) => {
        this.dataProfile = res.patient?.data || res.patient || res.data;
        this.populateForm();
      },
      error: () => {
        this.toastr.error('Failed to load profile details');
      },
    });
  }

  populateForm() {
    if (!this.dataProfile) return;
    const data = this.dataProfile;

    // 1. Match Country
    const matchedCountry = this.countries.find(
      (c) => c.countryId === data.countryId || c.countryName === data.country || c.countryId === Number(data.country)
    );
    const countryId = matchedCountry ? matchedCountry.countryId : (data.countryId || data.country || null);
    this.states = matchedCountry ? matchedCountry.states : [];

    // 2. Match State
    const matchedState = this.states.find(
      (s) => s.stateId === data.stateId || s.stateName === data.state || s.stateId === Number(data.state)
    );
    const stateId = matchedState ? matchedState.stateId : (data.stateId || data.state || null);
    this.cities = matchedState ? matchedState.cities : [];

    // 3. Match City
    const cityName = data.city || data.cityName || data.cityId || null;

    // Patch form without triggering valueChanges reset handlers
    this.profileForm.patchValue(
      {
        Name: data.name,
        IsMale: data.gender === 'Male' || data.isMale === true,
        BirthDate: data.birthDate ? String(data.birthDate).split('T')[0] : '',
        Country: countryId,
        State: stateId,
        City: cityName,
        MaritalStatus: data.maritalStatus,
        JobTitle: data.jobTitle,
        Height: data.height,
        Weight: data.weight,
      },
      { emitEvent: false }
    );
  }

  initForm() {
    this.profileForm = this.fb.group({
      Name: ['', Validators.required],
      IsMale: [null, Validators.required],
      BirthDate: ['', Validators.required],
      Country: [null, Validators.required],
      State: [null, Validators.required],
      City: [null, Validators.required],
      MaritalStatus: [null, Validators.required],
      JobTitle: [null, Validators.required],
      Height: [null, Validators.required],
      Weight: [null, Validators.required],
    });

    // الفورم مقفولة أول ما تفتح
    this.profileForm.disable();
  }

  /* =======================
     LISTEN TO DROPDOWNS
  ======================= */
  listenToChanges() {
    // Country change
    this.profileForm.get('Country')?.valueChanges.subscribe((countryId) => {
      const country = this.countries.find((c) => c.countryId === countryId);
      this.states = country ? country.states : [];
      this.cities = [];

      this.profileForm.patchValue({
        State: '',
        City: '',
      });
    });

    // State change
    this.profileForm.get('State')?.valueChanges.subscribe((stateId) => {
      const state = this.states.find((s) => s.stateId === stateId);
      this.cities = state ? state.cities : [];

      this.profileForm.patchValue({
        City: '',
      });
    });
  }

  private buildChangedFormData(): FormData {
    const formData = new FormData();

    Object.keys(this.profileForm.controls).forEach((key) => {
      const control = this.profileForm.get(key);

      if (control?.dirty) {
        let value = control.value;

        // تحويل خاص للـ Country / State
        if (key === 'Country') {
          const country = this.countries.find((c) => c.countryId === value);
          value = country?.countryName ?? '';
        }

        if (key === 'State') {
          const state = this.states.find((s) => s.stateId === value);
          value = state?.stateName ?? '';
        }

        formData.append(key, String(value));
      }
    });

    return formData;
  }

  // submitProfile() {
  //   if (this.profileForm.invalid) {
  //     this.profileForm.markAllAsTouched();
  //     return;
  //   }

  //   console.log(this.profileForm.value);
  //   this.showBtnSave = !this.showBtnSave;
  // }

  onEdit() {
    this.showBtnSave.set(true);
    this.profileForm.enable();
  }

  onCancel() {
    this.showBtnSave.set(false);
    this.profileForm.disable();
  }

  submitProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const formData = this.buildChangedFormData();

    console.log(this.profileForm.value);

    // 👇 اطبع علشان تجرب
    console.log('Changed fields only:');
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    this.patientService
      .updatePatientProfile( Number(this.patientId), formData)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.toastr.success('Profile updated successfully');
        },
        error: () => {
          this.toastr.error('Failed to update profile');
        },
      });

    this.profileForm.disable();
    this.showBtnSave.set(false);
  }
}
