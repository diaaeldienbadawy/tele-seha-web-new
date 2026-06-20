import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { PatientAuthService } from '../../service/patient-auth.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-patient-medical-history',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, TranslateModule],
  templateUrl: './patient-medical-history.component.html',
  styleUrl: './patient-medical-history.component.css',
})
export class PatientMedicalHistoryComponent {
  form!: FormGroup;

  patientId: string | null = null;

  sections: any[] = [];
  currentIndex = 0;
  currentSection: any = null;

  constructor(
    readonly fb: FormBuilder,
    readonly patientAuthService: PatientAuthService,
    readonly localStorageService: LocalstorageService,
    readonly toastr: ToastrService,
    readonly route: Router,
  ) {
    this.patientId = this.localStorageService.loggedInPatientId() || null;
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
          console.log('Saved Section:', res);

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

    // 👇 اطبع الفورم
    console.log('FORM VALUE:', this.form.value);

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
    } else {
      // 👇 رجوع لأول سكشن
      this.currentIndex = 0;
    }

    this.setCurrentSection();
  }
}
