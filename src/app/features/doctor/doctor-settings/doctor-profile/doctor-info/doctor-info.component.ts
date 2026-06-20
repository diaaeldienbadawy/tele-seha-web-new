import { Component, OnInit, signal } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LocalstorageService } from '../../../../../core/services/localstorage.service';
import { PatientService } from '../../../../../shared/services/patient.service';
import { PatientAuthService } from '../../../../patient/service/patient-auth.service';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { DoctorAuthService } from '../../../service/doctor-auth.service';
import { SpecialtiesService } from '../../../../../shared/services/specialties.service';
import { ISpecialties } from '../../../../../shared/interface/specialties.interface';
import { DoctorsService } from '../../../../../shared/services/doctors.service';
import { SpecialtyInfoComponent } from '../specialty-info/specialty-info.component';
import { CertificatesInfoComponent } from '../certificates-info/certificates-info.component';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-doctor-info',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Select,
    SpecialtyInfoComponent,
    CertificatesInfoComponent,
    DatePickerModule,
  ],
  templateUrl: './doctor-info.component.html',
  styleUrl: './doctor-info.component.css',
})
export class DoctorInfoComponent implements OnInit {
  imagePreview: string | null = null;
  selectedImage!: File;
  fileName: string = '';

  basicInfoForm!: FormGroup;

  showBtnSave = signal<boolean>(false);

  today: Date = new Date();
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];

  genders = [
    { name: 'Male', code: true },
    { name: 'Female', code: false },
  ];

  University: any[] = [];
  doctorId: any;
  dataProfile: any;

  constructor(
    readonly fb: FormBuilder,
    readonly localStorageService: LocalstorageService,
    readonly doctorAuthService: DoctorAuthService,
    readonly doctorService: DoctorsService,
    readonly specialtiesService: SpecialtiesService,
    private patientAuthService: PatientAuthService,
    readonly toastr: ToastrService,
  ) {
    this.doctorId = this.localStorageService.get('doctorId');
  }

  ngOnInit(): void {
    this.initForm();
    this.getDoctorDataList();
    this.getAllSpecialties();
    // this.loadInfoLists();
  }

  loadInfoLists() {
    this.patientAuthService.getInfoLists().subscribe({
      next: (res) => {
        this.countries = res.countries || [];
        this.listenToChanges();
        this.loadDoctorDetails();
      },
      error: () => {
        this.toastr.error('Failed to load info lists');
      },
    });
  }

  getDoctorDataList() {
    this.doctorAuthService.getDoctorDataList().subscribe({
      next: (res) => {
        this.University = res;
        this.loadInfoLists();
      },
      error: () => {
        this.toastr.error('Failed to load info lists');
      },
    });
  }

  listenToChanges() {
    this.basicInfoForm.get('Country')?.valueChanges.subscribe((countryName) => {
      const country = this.countries.find((c) => c.countryName === countryName);
      this.states = country?.states || [];
      this.cities = [];
      this.basicInfoForm.patchValue({ State: null, City: null });
    });

    this.basicInfoForm.get('State')?.valueChanges.subscribe((stateName) => {
      const state = this.states.find((s) => s.stateName === stateName);

      this.cities =
        state?.cities.map((city: string) => ({
          cityName: city,
        })) || [];

      this.basicInfoForm.patchValue({ City: null });
    });
  }

  specialties: ISpecialties[] = [];
  getAllSpecialties() {
    this.specialtiesService.getSpecialties().subscribe({
      next: (res) => {
        this.specialties = res.data || res;
      },
      error: (err) => {
        console.error('Failed to load specialties', err);
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

      University: [''],

      DoctorId: [null],
    });
  }
  loadDoctorDetails() {
    this.doctorService.getDoctorProfile(this.doctorId).subscribe({
      next: (res) => {
        this.dataProfile = res.data;
        const profile = this.dataProfile?.doctorProfile;

        const birthDate = profile?.birthDate
          ? new Date(profile.birthDate)
          : null;

        const matchedUniversity =
          this.University.find(
            (u) => u.universityNameEn === profile?.universityEn,
          ) || null;

        // عبي الـ states و cities الأول قبل الـ setValue
        const countryInput = profile?.country || null;
        const matchedCountry =
          this.countries.find((c) => c.countryName === countryInput || c.countryId === (countryInput ? +countryInput : null)) || null;

        let countryFormValue = countryInput;
        if (matchedCountry) {
          this.states = matchedCountry.states || [];
          countryFormValue = matchedCountry.countryName;
        }

        const stateInput = profile?.state || null;
        const matchedState =
          this.states.find((s) => s.stateName === stateInput || s.stateId === (stateInput ? +stateInput : null)) || null;

        let stateFormValue = stateInput;
        if (matchedState) {
          this.cities = matchedState.cities.map((city: string) => ({
            cityName: city,
          }));
          stateFormValue = matchedState.stateName;

          // ⭐ اجبر الـ select يعيد القراءة
          setTimeout(() => {
            this.basicInfoForm.patchValue({
              City: profile?.city ?? null,
            });
          });
        }

        const matchedCity =
          this.cities.find((c: any) => c.cityName === profile?.city) || null;

        this.basicInfoForm.setValue(
          {
            Description: profile?.description ?? '',
            BirthDate: birthDate,
            IsMale: profile?.isMale ?? null,
            University: matchedUniversity,
            Country: countryFormValue,
            State: stateFormValue,
            City: matchedCity?.cityName ?? null,
            Image: profile?.imageUrl ?? null,
            DoctorId: null,
          },
          { emitEvent: false },
        );

        console.log(
          'this.basicInfoForm.valuessssssssssssssssssssssssssssssssssss',
        );
        console.log(this.basicInfoForm.value);

        this.basicInfoForm.disable({ emitEvent: false });

        if (profile?.imageUrl) {
          this.imagePreview = profile.imageUrl;
        }
      },
      error: () => {
        this.toastr.error('Failed to load doctor info');
      },
    });
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedImage = file;
      this.fileName = file.name;
      this.imagePreview = URL.createObjectURL(file);

      this.basicInfoForm.patchValue({
        Image: file,
      });
      this.basicInfoForm.get('Image')?.updateValueAndValidity();
    }
  }

  save() {
    if (this.basicInfoForm.invalid) {
      this.basicInfoForm.markAllAsTouched();
      return;
    }

    const value = this.basicInfoForm.value;
    const formData = new FormData();

    if (this.selectedImage) {
      formData.append('Image', this.selectedImage);
    }

    formData.append('Description', value.Description ?? '');

    if (value.BirthDate) {
      formData.append('BirthDate', new Date(value.BirthDate).toISOString());
    }

    formData.append('IsMale', value.IsMale ?? '');

    formData.append('Country', value.Country ?? '');
    formData.append('State', value.State ?? '');
    formData.append('City', value.City ?? '');

    if (value.University) {
      formData.append('UniversityAr', value.University.universityName);
      formData.append('UniversityEn', value.University.universityNameEn);
    }

    this.doctorService.updateDoctorProfile(this.doctorId, formData).subscribe({
      next: () => {
        this.toastr.success('Doctor info updated successfully');
        this.loadDoctorDetails();
        this.showBtnSave.set(false);
        this.basicInfoForm.disable({ emitEvent: false });
      },
      error: () => {
        this.toastr.error('Failed to update doctor info');
      },
    });
  }

  edit() {
    this.showBtnSave.set(true);
    this.basicInfoForm.enable({ emitEvent: false });
  }

  cancel() {
    this.showBtnSave.set(false);
    this.basicInfoForm.disable({ emitEvent: false });
    this.loadDoctorDetails();
  }
}
