import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { DoctorAuthService } from '../../../service/doctor-auth.service';
import { DoctorsService } from '../../../../../shared/services/doctors.service';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { ToastrService } from 'ngx-toastr';
import { MeetingDiagnosisStateService } from '../../../service/meeting-diagnosis-state.service';

/**
 * تشخيص الكشف: الطبيب بيختار من كتالوج التشخيصات (نفس فكرة الأدوية والتحاليل والأشعة)،
 * واللي بيتخزن على الميتينج هو أسماء التشخيصات المختارة — عشان تظهر بعد كده في سجل الكشوفات.
 */
@Component({
  selector: 'app-add-edit-diagnosis',
  imports: [CommonModule, Select, ReactiveFormsModule],
  templateUrl: './add-edit-diagnosis.component.html',
  styleUrl: './add-edit-diagnosis.component.css',
})
export class AddEditDiagnosisComponent implements OnInit {
  constructor(readonly DoctorAuthService: DoctorAuthService) {}

  diagnoses: any[] = [];
  diagnosisForm!: FormGroup;
  private readonly diagnosisSearchSubject$ = new Subject<string>();
  readonly toastr = inject(ToastrService);
  private readonly doctorsService = inject(DoctorsService);

  @Output() closeDiagnosis = new EventEmitter<void>();

  meetingId!: number;
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly diagnosisState = inject(MeetingDiagnosisStateService);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.meetingId = +params['meetingId'];
    });

    this.loadDiagnoses();
    this.initDiagnosisForm();
    this.diagnosisSearchSubject();

    // التشخيص الحالي بييجي من الميتينج نفسه (نفس مصدر الروشتة والتحاليل).
    this.prefillFromMeeting();
  }

  private prefillFromMeeting(): void {
    this.doctorsService.getReports(this.meetingId, true).subscribe({
      next: (res: any) => {
        const saved: string[] = res?.diagnoses ?? [];
        // نفس مصدر السيرفر بيحدّد كمان هل باقي أزرار الكشف مفتوحة ولا لأ.
        this.diagnosisState.setFromMeetingReport(this.meetingId, saved);
        if (!saved.length) return;

        const rows = this.diagnosisRows;
        rows.clear();

        // المخزَّن أسماء مش ids — بنحمّل الأسماء دي في القائمة بمعرّفات مؤقتة عشان
        // الـ select يعرض التشخيص المحفوظ بدل ما يبان فاضي.
        saved.forEach((name, i) => {
          const known = this.diagnoses.find((d) => d.name === name);
          const id = known?.id ?? -(i + 1);
          if (!known) this.diagnoses = [...this.diagnoses, { id, name }];
          rows.push(this.fb.group({ id: [id, Validators.required], name: [name] }));
        });
      },
      error: (err) => console.error('Failed to load current diagnosis:', err),
    });
  }

  initDiagnosisForm(): void {
    this.diagnosisForm = this.fb.group({
      diagnosesList: this.fb.array([this.createDiagnosis()]),
    });
  }

  get diagnosisRows(): FormArray {
    return this.diagnosisForm.get('diagnosesList') as FormArray;
  }

  addDiagnosis(): void {
    this.diagnosisRows.push(this.createDiagnosis());
  }

  createDiagnosis(): FormGroup {
    return this.fb.group({
      id: [null, Validators.required],
      name: [''],
    });
  }

  /** مؤشر بحث صغير — البحث اللحظي مبيرفعش سبينر الصفحة. */
  isSearching = false;

  /**
   * منسبش الصفوف المختارة بالفعل من غير label بعد ما القائمة تتبدل — بحث جديد أو تحميل
   * الكتالوج اللي بيوصل بعد الـ prefill كان هيمسح التشخيص المحفوظ من الـ select.
   */
  private withSelectedRows(list: any[]): any[] {
    const selected = (this.diagnosisForm ? this.diagnosisRows.value : []) ?? [];
    const missing = selected.filter(
      (d: any) => d?.id != null && !list.some((x: any) => x.id === d.id),
    );
    return [...list, ...missing];
  }

  diagnosisSearchSubject() {
    this.diagnosisSearchSubject$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((search) => this.DoctorAuthService.getDiagnoses(search)),
      )
      .subscribe({
        next: (res) => {
          this.isSearching = false;
          this.diagnoses = this.withSelectedRows(res);
        },
        error: () => {
          this.isSearching = false;
        },
      });
  }

  removeDiagnosis(index: number): void {
    if (this.diagnosisRows.length > 1) {
      this.diagnosisRows.removeAt(index);
    }
  }

  onDiagnosisSelect(event: any, index: number) {
    const selected = this.diagnoses.find((x) => x.id === event.value);

    this.diagnosisRows.at(index).patchValue({
      id: selected?.id,
      name: selected?.name,
    });
  }

  onDiagnosisSearch(event: any): void {
    this.isSearching = true;
    this.diagnosisSearchSubject$.next(event.filter);
  }

  loadDiagnoses(search: string = ''): void {
    this.DoctorAuthService.getDiagnoses(search).subscribe({
      next: (res) => {
        this.diagnoses = this.withSelectedRows(res);
      },
      error: (err) => {
        console.log('Diagnoses Error:', err.error);
      },
    });
  }

  submitDiagnosis(): void {
    if (this.diagnosisForm.invalid) {
      this.diagnosisForm.markAllAsTouched();
      return;
    }

    // الـ API بياخد أسماء مش ids، وبيستبدل القائمة كلها في كل مرة.
    const diagnosesList: string[] = (this.diagnosisRows.value ?? [])
      .map((row: any) => row?.name)
      .filter((name: string) => !!name && name.trim() !== '');

    if (!diagnosesList.length) {
      this.toastr.error('اختر تشخيص واحد على الأقل');
      return;
    }

    this.DoctorAuthService.sendDiagnoses(this.meetingId, { diagnosesList }).subscribe({
      next: () => {
        this.toastr.success('تم حفظ التشخيص بنجاح');
        // بيفتح أزرار الروشتة/التحاليل/الأشعة وإنهاء الكشف فورًا.
        this.diagnosisState.markDiagnosisRecorded();
        this.closeDiagnosis.emit();
      },
      error: (err) => {
        const apiError = err?.error;
        this.toastr.error(
          apiError?.message ||
            (typeof apiError === 'string' && apiError ? apiError : 'تعذر حفظ التشخيص'),
        );
      },
    });
  }
}
