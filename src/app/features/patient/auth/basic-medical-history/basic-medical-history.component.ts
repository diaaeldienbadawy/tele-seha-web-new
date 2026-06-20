import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PatientAuthService } from '../../service/patient-auth.service';
import { GlobalUserStateService } from '../../../../core/services/state/global-user-state.service';
import { PatientRegistrationStateService } from '../../../../core/services/state/patient-registration-state.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-basic-medical-history',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, TranslateModule],
  templateUrl: './basic-medical-history.component.html',
  styleUrl: './basic-medical-history.component.css',
})
export class BasicMedicalHistoryComponent {
  form!: FormGroup;

  patientId: string | null = null;

  sections: any[] = [];
  currentIndex = 0;
  currentSection: any = null;

  constructor(
    readonly fb: FormBuilder,
    readonly patientAuthService: PatientAuthService,
    readonly globalUserStateService: GlobalUserStateService,
    readonly patientRegistrationStateService: PatientRegistrationStateService,
    readonly toastr: ToastrService,
    readonly route: Router,
    readonly activatedRoute: ActivatedRoute,
  ) {
    this.patientId = this.globalUserStateService.loggedInPatientId() || this.globalUserStateService.patientId() || this.patientRegistrationStateService.patientId() || null;
  }

  ngOnInit(): void {
    this.initForm();
    this.loadMedicalProfileSection();
  }

  initForm() {
    this.form = this.fb.group({
      answer: ['', Validators.required],
    });
  }

  /* =======================
     LOAD ALL SECTIONS
     ======================= */
  loadMedicalProfileSection() {
    this.patientAuthService.medicalProfileSection().subscribe({
      next: (res: any) => {
        this.sections = res;
        const from = this.activatedRoute.snapshot.queryParamMap.get('from');
        if (from === 'info-about-you' && this.sections.length > 0) {
          this.currentIndex = this.sections.length - 1;
        } else {
          this.currentIndex = 0;
        }
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
    this.form.reset();
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
          if (!res) return;

          /* ===== YES / NO ===== */
          this.form.patchValue({
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
        error: () => {
          // this.toastr.error('Please try again');
        },
      });
  }

  /* =======================
     SAVE SECTION
     ======================= */
  save() {
    if (this.form.invalid) return;

    const answer = this.form.value.answer;

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

    this.patientAuthService
      .savePatientMedicalProfileSection(payload)
      .subscribe({
        next: () => {
          this.goNextSection();
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
      this.form.reset();
      this.sections = [];
      this.currentSection = null;
      this.route.navigate(['/patient/auth/register/info-about-you']);
    }
  }

  /* =======================
     BACK SECTION / STEP
     ======================= */
  goBack() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.setCurrentSection();
    } else {
      this.route.navigate(['/patient/auth/register/basic-info']);
    }
  }

  clearLocalStorage() {
    this.globalUserStateService.clearUserData();
    this.patientRegistrationStateService.clearRegistrationData();
    localStorage.clear();
    this.route.navigate(['/']);
  }
}
