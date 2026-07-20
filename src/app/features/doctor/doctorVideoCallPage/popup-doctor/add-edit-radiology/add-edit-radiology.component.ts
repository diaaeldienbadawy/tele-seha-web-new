import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { DoctorAuthService } from '../../../service/doctor-auth.service';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { Select } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { DoctorsService } from '../../../../../shared/services/doctors.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-edit-radiology',
  imports: [Select, ReactiveFormsModule, CommonModule],
  templateUrl: './add-edit-radiology.component.html',
  styleUrl: './add-edit-radiology.component.css',
})
export class AddEditRadiologyComponent implements OnInit {
  constructor(readonly DoctorAuthService: DoctorAuthService) {}

  radiology: any[] = [];
  radiologyForm!: FormGroup;
  private readonly radiologySearchSubject$ = new Subject<string>();
  @Output() closeRadiology = new EventEmitter<void>();
  readonly toastr = inject(ToastrService);
  private readonly doctorsService = inject(DoctorsService);

  meetingId!: number;
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.meetingId = +params['meetingId'];
    });

    // Radiology
    this.loadRadiology();
    this.initRadiologyForm();
    this.radiologySearchSubject();

    // طلب الأشعة الحالي بييجي من الميتينج نفسه — مش من id متخزن في localStorage
    // (المفتاح المتخزن كان بيعيش عبر الميتينجات → تعديل طلب ميتينج قديم = 403).
    this.prefillFromMeeting();
  }

  private prefillFromMeeting(): void {
    this.doctorsService.getReports(this.meetingId, true).subscribe({
      next: (res: any) => {
        const request = res?.radiologicalExaminationRequest;
        if (!request) return;

        this.radiologyForm.patchValue({
          meetingId: this.meetingId,
          notes: request.notes || '',
        });

        const examinationsArray = this.radiologyMedicines;
        examinationsArray.clear();

        (request.radiologicalExaminations || []).forEach((exam: any) => {
          examinationsArray.push(
            this.fb.group({
              id: [exam.id, Validators.required],
              name: [exam.name],
              position: [exam.position || ''],
              notes: [exam.notes || ''],
            }),
          );
        });

        if (!examinationsArray.length) examinationsArray.push(this.createRadiology());
      },
      error: (err) => console.error('Failed to load current radiology request:', err),
    });
  }

  initRadiologyForm(): void {
    this.radiologyForm = this.fb.group({
      meetingId: [null, Validators.required],
      examinations: this.fb.array([this.createRadiology()]),
      notes: [''],
    });
  }

  /** مؤشر بحث صغير — البحث اللحظي مبقاش يرفع سبينر الصفحة. */
  isSearching = false;

  radiologySearchSubject() {
    this.radiologySearchSubject$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((search) => this.DoctorAuthService.getRadiology(search)),
      )
      .subscribe({
        next: (res) => {
          this.isSearching = false;
          // منسبش الصفوف المختارة بالفعل من غير label بعد ما القائمة تتبدل
          const selected = (this.radiologyMedicines.value ?? []).filter(
            (m: any) => m?.id != null && !res.some((x: any) => x.id === m.id),
          );
          this.radiology = [...res, ...selected];
        },
        error: () => {
          this.isSearching = false;
        },
      });
  }

  createRadiology(): FormGroup {
    return this.fb.group({
      id: [null, Validators.required],
      name: [''],
      position: [''],
      notes: [''],
    });
  }

  get radiologyMedicines(): FormArray {
    return this.radiologyForm.get('examinations') as FormArray;
  }
  addRadiology(): void {
    this.radiologyMedicines.push(this.createRadiology());
  }

  removeRadiology(index: number): void {
    if (this.radiologyMedicines.length > 1) {
      this.radiologyMedicines.removeAt(index);
      console.log(this.radiologyMedicines.value);
    }
  }

  onRadiologySelect(event: any, index: number): void {
    const selectedId = event.value;
    const selected = this.radiology.find((x) => x.id === selectedId);
    this.radiologyMedicines.at(index).patchValue({
      id: selected?.id,
      name: selected?.name,
      notes: selected?.notes,
    });
  }

  onRadiologySearch(event: any): void {
    this.isSearching = true;
    this.radiologySearchSubject$.next(event.filter);
  }

  loadRadiology(search: string = ''): void {
    this.DoctorAuthService.getRadiology(search).subscribe({
      next: (res) => {
        this.radiology = res;
      },
      error: (err) => {
        console.log('Radiology Error:', err.error);
      },
    });
  }

  submitRadiology(): void {
    this.radiologyForm.patchValue({
      meetingId: this.meetingId,
    });
    if (this.radiologyForm.invalid) {
      this.radiologyForm.markAllAsTouched();
      return;
    }

    // POST دايمًا: السيرفر بيعمل upsert على مستوى الميتينج — مفيش اعتماد على ids متخزنة.
    this.DoctorAuthService.sendRadiology(this.radiologyForm.value).subscribe({
      next: () => {
        this.toastr.success('تم حفظ طلب الأشعة بنجاح');
        this.closeRadiology.emit();
      },
      error: (err) => {
        const apiError = err?.error;
        this.toastr.error(
          apiError?.message ||
            (typeof apiError === 'string' && apiError ? apiError : 'تعذر حفظ طلب الأشعة'),
        );
      },
    });
  }
}
