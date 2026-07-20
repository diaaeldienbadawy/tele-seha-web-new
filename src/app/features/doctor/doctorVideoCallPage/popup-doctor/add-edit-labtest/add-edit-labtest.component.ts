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

@Component({
  selector: 'app-add-edit-labtest',
  imports: [CommonModule, Select, ReactiveFormsModule],
  templateUrl: './add-edit-labtest.component.html',
  styleUrl: './add-edit-labtest.component.css',
})
export class AddEditLabtestComponent implements OnInit {
  constructor(readonly DoctorAuthService: DoctorAuthService) {}
  labTest: any[] = [];
  labTestForm!: FormGroup;
  private readonly labTestSearchSubject$ = new Subject<string>();
  readonly toastr = inject(ToastrService);
  private readonly doctorsService = inject(DoctorsService);

  @Output() closeLab = new EventEmitter<void>();

  meetingId!: number;
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.meetingId = +params['meetingId'];
    });

    // Lab Tests
    this.loadLabTests();
    this.initLabTestForm();
    this.labTestSearchSubject();

    // طلب التحاليل الحالي بييجي من الميتينج نفسه — مش من id متخزن في localStorage
    // (المفتاح المتخزن كان بيعيش عبر الميتينجات → تعديل طلب ميتينج قديم = 403).
    this.prefillFromMeeting();
  }

  private prefillFromMeeting(): void {
    this.doctorsService.getReports(this.meetingId, true).subscribe({
      next: (res: any) => {
        const request = res?.labAnalysisRequest;
        if (!request) return;

        this.labTestForm.patchValue({
          meetingId: this.meetingId,
          notes: request.notes || '',
        });

        const labArray = this.labTestMedicines;
        labArray.clear();

        (request.labAnalyses ?? []).forEach((lab: any) => {
          labArray.push(
            this.fb.group({
              id: [lab.id, Validators.required],
              name: [lab.name],
              position: [lab.position || ''],
              notes: [lab.notes || ''],
            }),
          );
        });

        if (!labArray.length) labArray.push(this.createLabTest());
      },
      error: (err) => console.error('Failed to load current lab request:', err),
    });
  }

  initLabTestForm(): void {
    this.labTestForm = this.fb.group({
      meetingId: [null, Validators.required],
      labAnalysisList: this.fb.array([this.createLabTest()]),
      notes: [''],
    });
  }

  get labTestMedicines(): FormArray {
    return this.labTestForm.get('labAnalysisList') as FormArray;
  }
  addLabTest(): void {
    this.labTestMedicines.push(this.createLabTest());
  }

  createLabTest(): FormGroup {
    return this.fb.group({
      id: [null, Validators.required],
      name: [''],
      position: [''],
      notes: [''],
    });
  }
  /** مؤشر بحث صغير — البحث اللحظي مبقاش يرفع سبينر الصفحة. */
  isSearching = false;

  labTestSearchSubject() {
    this.labTestSearchSubject$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((search) => this.DoctorAuthService.getLabTest(search)),
      )
      .subscribe({
        next: (res) => {
          this.isSearching = false;
          // منسبش الصفوف المختارة بالفعل من غير label بعد ما القائمة تتبدل
          const selected = (this.labTestMedicines.value ?? []).filter(
            (m: any) => m?.id != null && !res.some((x: any) => x.id === m.id),
          );
          this.labTest = [...res, ...selected];
        },
        error: () => {
          this.isSearching = false;
        },
      });
  }

  removeLabTest(index: number): void {
    if (this.labTestMedicines.length > 1) {
      this.labTestMedicines.removeAt(index);
      console.log(this.labTestMedicines.value);
    }
  }

  onLabTestSelect(event: any, index: number) {
    const selectedId = event.value;

    const selected = this.labTest.find((x) => x.id === selectedId);

    this.labTestMedicines.at(index).patchValue({
      id: selected?.id,
      name: selected?.name,
      notes: selected?.notes,
    });
  }

  onLabTestSearch(event: any): void {
    this.isSearching = true;
    this.labTestSearchSubject$.next(event.filter);
  }

  loadLabTests(search: string = ''): void {
    this.DoctorAuthService.getLabTest(search).subscribe({
      next: (res) => {
        this.labTest = res;
      },
      error: (err) => {
        console.log('Lab Tests Error:', err.error);
      },
    });
  }

  submitLabTest(): void {
    this.labTestForm.patchValue({
      meetingId: this.meetingId,
    });
    if (this.labTestForm.invalid) {
      this.labTestForm.markAllAsTouched();
      return;
    }

    // POST دايمًا: السيرفر بيعمل upsert على مستوى الميتينج — مفيش اعتماد على ids متخزنة.
    this.DoctorAuthService.sendLab(this.labTestForm.value).subscribe({
      next: () => {
        this.toastr.success('تم حفظ طلب التحاليل بنجاح');
        this.closeLab.emit();
      },
      error: (err) => {
        const apiError = err?.error;
        this.toastr.error(
          apiError?.message ||
            (typeof apiError === 'string' && apiError ? apiError : 'تعذر حفظ طلب التحاليل'),
        );
      },
    });
  }
}
