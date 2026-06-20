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
    this.loadInfoLists();
    this.loadPatientDetails();
    this.listenToChanges();
  }

  dataProfile: any;

  loadPatientDetails() {
    this.patientService.getPatientProfile(Number(this.patientId)).subscribe({
      next: (res) => {
        console.log(res);
        this.dataProfile = res.patient?.data;

        this.profileForm.patchValue({
          Name: this.dataProfile.name,
          IsMale: this.dataProfile.gender === 'Male',
          BirthDate: this.dataProfile.birthDate,
          Country: this.dataProfile.countryId,
          State: this.dataProfile.stateId,
          City: this.dataProfile.cityId,
          MaritalStatus: this.dataProfile.maritalStatus,
          JobTitle: this.dataProfile.jobTitle,
          Height: this.dataProfile.height,
          Weight: this.dataProfile.weight,
        });
      },
      error: () => {
        this.toastr.error('Failed to load info lists');
      },
    });
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
     LOAD LISTS
  ======================= */
  loadInfoLists() {
    this.patientAuthService.getInfoLists().subscribe({
      next: (res) => {
        console.log(res);

        this.countries = res.countries || [];
        this.maritalStatus = res.maritalStatus || [];
        const rawJobs = res.jobTitles || res.jobTitle || [];
        this.jobTitles = rawJobs.map((item: any) => {
          if (typeof item === 'string') return item;
          return item.titleAr || item.titleEn || item.nameAr || item.nameEn || item.name || item.title || '';
        }).filter(Boolean);
      },
      error: () => {
        this.toastr.error('Failed to load info lists');
      },
    });
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
