import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Select } from 'primeng/select';
import { PatientAuthService } from '../../service/patient-auth.service';
import { ToastrService } from 'ngx-toastr';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-patient-create-new-profile',
  imports: [ReactiveFormsModule, FormsModule, Select, CommonModule, TranslateModule],
  templateUrl: './patient-create-new-profile.component.html',
  styleUrl: './patient-create-new-profile.component.css',
})
export class PatientCreateNewProfileComponent implements OnInit {
  genders = [
    { name: 'Male', code: true },
    { name: 'Female', code: false },
  ];

  showStep1: boolean = true;
  showStep2: boolean = false;
  showStep3: boolean = false;

  selectedGender: string = '';
  basicInfoForm!: FormGroup;

  // step 2
  historyform!: FormGroup;

  sections: any[] = [];
  currentIndex = 0;
  currentSection: any = null;

  // step 3

  InfoForm!: FormGroup;

  patientId: string | null = null;

  countries: any[] = [];
  states: any[] = [];
  cities: string[] = [];

  maritalStatus: string[] = [];
  jobTitles: string[] = [];

  constructor(
    readonly fb: FormBuilder,
    readonly patientAuthService: PatientAuthService,
    readonly toastr: ToastrService,
    readonly localstorageService: LocalstorageService,
  ) {
    this.patientId = this.localstorageService.loggedInPatientId() || null;
  }

  ngOnInit(): void {
    this.initForm();
    this.initInfoForm();
    this.initHistoryform();
    this.loadInfoLists();
    this.listenToChanges();
    this.loadMedicalProfileSection();
  }

  // step 1
  //#region
  initForm() {
    this.basicInfoForm = this.fb.group({
      Name: ['', [Validators.required]],
      IsMale: ['', [Validators.required]],
      BirthDate: ['', [Validators.required]],
    });
  }

  save() {
    console.log(this.basicInfoForm.value);

    if (this.basicInfoForm.invalid) {
      this.basicInfoForm.markAllAsTouched();
      return;
    }

    this.patientAuthService.basicInfo(this.basicInfoForm.value).subscribe({
      next: (res: any) => {
        console.log(res);
        this.showStep1 = false;
        this.showStep2 = true;
        this.basicInfoForm.reset();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  //#endregion

  // step 2
  //#region

  initHistoryform() {
    this.historyform = this.fb.group({
      answer: ['', Validators.required],
    });
  }

  /* =======================
     LOAD ALL SECTIONS
     ======================= */
  loadMedicalProfileSection() {
    this.patientAuthService.medicalProfileSection().subscribe({
      next: (res: any[]) => {
        this.sections = res;
        this.setCurrentSection();
      },
      error: () => {
        this.toastr.error('Failed to load sections');
      },
    });
  }

  /* =======================
     SET CURRENT SECTION
     ======================= */
  setCurrentSection() {
    this.currentSection = this.sections[this.currentIndex];
    this.historyform.reset();
    this.loadSectionByPatient();
  }

  /* =======================
     LOAD SAVED DATA (BY ID)
     ======================= */
  loadSectionByPatient() {
    this.patientAuthService
      .medicalProfileSectionByPatientId(
        Number(this.patientId),
        this.currentSection.sectionId,
      )
      .subscribe({
        next: (res: any) => {
          console.log('Saved Section:', res);

          if (!res) return;

          /* ===== YES / NO ===== */
          this.historyform.patchValue({
            answer: res.count > 0 ? 'Yes' : 'No',
          });

          if (!res.subSections) return;

          /* ===== MAP SAVED DATA TO ORIGINAL STRUCTURE ===== */
          this.currentSection.subSection.forEach((sub: any) => {
            const savedSub = res.subSections.find(
              (s: any) => s.subSectionId === sub.subSectionId,
            );

            if (!savedSub) return;

            sub.items.forEach((item: any) => {
              const savedItem = savedSub.items.find(
                (i: any) => i.itemName === item.itemName,
              );

              item.checked = savedItem ? savedItem.count === 1 : false;
            });
          });
        },
      });
  }

  /* =======================
     SAVE SECTION
     ======================= */
  savehistoryform() {
    if (this.historyform.invalid) return;

    const answer = this.historyform.value.answer;

    const payload = {
      patientId: Number(this.patientId),
      section: {
        sectionId: this.currentSection.sectionId,
        sectionName: this.currentSection.sectionName,
        question: this.currentSection.question,
        count: answer === 'Yes' ? 1 : 0,
        subSections: answer === 'Yes' ? this.mapSubSections() : [],
      },
    };

    // 👇 اطبع الفورم
    console.log('FORM VALUE:', this.historyform.value);

    // 👇 اطبع ال payload قبل الإرسال
    console.log('PAYLOAD SENT:', payload);

    this.patientAuthService
      .savePatientMedicalProfileSection(payload)
      .subscribe({
        next: () => {
          this.goNextSection();
        },
        error: () => {
          this.toastr.error('Save failed');
        },
      });
  }

  /* =======================
     MAP SUB SECTIONS
     ======================= */
  mapSubSections() {
    return (
      this.currentSection.subSection
        // subSection لازم يكون فيها item واحد على الأقل متحدد
        .filter((sub: any) => sub.items.some((item: any) => item.checked))
        .map((sub: any) => ({
          subSectionId: sub.subSectionId,
          subSectionName: sub.subSectionName,
          count: 1,
          items: sub.items
            // ابعت بس اللي متحدد
            .filter((item: any) => item.checked)
            .map((item: any) => ({
              itemName: item.itemName,
              count: 1,
            })),
        }))
    );
  }

  /* =======================
     NEXT SECTION
     ======================= */
  goNextSection() {
    if (this.currentIndex < this.sections.length - 1) {
      this.currentIndex++;
      this.setCurrentSection();
    } else {
      this.toastr.success('Medical history completed');
      this.historyform.reset();
      this.sections = [];
      this.currentSection = null;
      this.showStep1 = false;
      this.showStep2 = false;
      this.showStep3 = true;
    }
  }

  //#endregion

  // step 3
  // ==================================================================
  //#region
  initInfoForm() {
    this.InfoForm = this.fb.group({
      Country: ['', Validators.required],
      State: ['', Validators.required],
      City: ['', Validators.required],
      MaritalStatus: ['', Validators.required],
      JobTitle: ['', Validators.required],
      Height: ['', Validators.required],
      Weight: ['', Validators.required],
    });
  }

  loadInfoLists() {
    this.patientAuthService.getInfoLists().subscribe({
      next: (res) => {
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

  listenToChanges() {
    // Country change
    this.InfoForm.get('Country')?.valueChanges.subscribe((countryId) => {
      const country = this.countries.find((c) => c.countryId === countryId);
      this.states = country ? country.states : [];
      this.cities = [];

      this.InfoForm.patchValue({
        State: '',
        City: '',
      });
    });

    // State change
    this.InfoForm.get('State')?.valueChanges.subscribe((stateId) => {
      const state = this.states.find((s) => s.stateId === stateId);
      this.cities = state ? state.cities : [];

      this.InfoForm.patchValue({
        City: '',
      });
    });
  }

  /* =======================
     BUILD FORM DATA (STRINGS)
  ======================= */
  private buildFormData(): FormData {
    const formValue = this.InfoForm.value;

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

  saveStep3() {
    if (this.InfoForm.invalid) {
      this.toastr.error('Please fill all fields');
      return;
    }

    const formData = this.buildFormData();

    this.patientAuthService
      .completeProfilePatient(formData, Number(this.patientId))
      .subscribe({
        next: (res) => {
          this.toastr.success('Profile completed successfully');
          console.log('Response:', res);

          this.showStep1 = true;
          this.showStep2 = false;
          this.showStep3 = false;
          this.sections = [];
          this.currentSection = null;
          this.currentIndex = 0;

          this.InfoForm.reset();
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  //#endregion
}
