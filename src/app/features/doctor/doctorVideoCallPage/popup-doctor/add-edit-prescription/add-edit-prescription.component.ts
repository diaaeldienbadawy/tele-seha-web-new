import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Select } from 'primeng/select';
import { DoctorAuthService } from '../../../service/doctor-auth.service';
import { DoctorsService } from '../../../../../shared/services/doctors.service';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-edit-prescription',
  imports: [ReactiveFormsModule, Select, CommonModule],
  templateUrl: './add-edit-prescription.component.html',
  styleUrl: './add-edit-prescription.component.css',
})
export class AddEditPrescriptionComponent implements OnInit {
  constructor(readonly DoctorAuthService: DoctorAuthService) {}
  drugs: any[] = [];
  prescriptionForm!: FormGroup;
  private readonly prescriptionSearchSubject$ = new Subject<string>();
  readonly toastr = inject(ToastrService);
  private readonly doctorsService = inject(DoctorsService);

  @Output() closePrescription = new EventEmitter<void>();

  meetingId!: number;
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.meetingId = +params['meetingId'];
    });

    // Prescription
    this.loadDrugs();
    this.initPrescriptionForm();
    this.prescriptionSearchSubject();
  }

  /**
   * الروشتة الحالية بتيجي من الميتينج نفسه (من السيرفر) — مش من id متخزن في localStorage:
   * المفتاح المتخزن كان بيعيش عبر الميتينجات، فالبوب أب كان بيحاول يعدّل روشتة ميتينج
   * قديم (403 من السيرفر) أو أسوأ: يكتب فوق روشتة مريض تاني.
   */
  private prefillFromMeeting(): void {
    this.doctorsService.getReports(this.meetingId, true).subscribe({
      next: (res: any) => {
        const prescription = res?.prescription;
        if (!prescription) return;

        this.prescriptionForm.patchValue({
          meetingId: this.meetingId,
          notes: prescription.notes || '',
        });

        // p-select only shows a value if it exists in [options]; merge so every saved id resolves
        this.ensureDrugsIncludeMedicines(prescription.medicines ?? []);

        const medicinesArray = this.medicines;
        medicinesArray.clear(); // مهم جدا

        (prescription.medicines ?? []).forEach((medicine: any) => {
          medicinesArray.push(
            this.fb.group({
              id: [medicine.id],
              name: [medicine.name],
              instructions: [medicine.instructions],
            }),
          );
        });

        if (!medicinesArray.length) medicinesArray.push(this.createMedicine());
      },
      error: (err) => console.error('Failed to load current prescription:', err),
    });
  }

  initPrescriptionForm(): void {
    this.prescriptionForm = this.fb.group({
      meetingId: [null, Validators.required],
      medicines: this.fb.array([this.createMedicine()]),
      notes: [''],
    });
  }

  get medicines(): FormArray {
    return this.prescriptionForm.get('medicines') as FormArray;
  }

  private ensureDrugsIncludeMedicines(
    medicines: Array<{ id: number; name: string; instructions?: string }>,
  ): void {
    if (!medicines?.length) return;
    const existing = new Set(this.drugs.map((d) => d.id));
    const extra = medicines
      .filter((m) => m?.id != null && !existing.has(m.id))
      .map((m) => ({
        id: m.id,
        name: m.name,
        instructions: m.instructions,
      }));
    if (extra.length) {
      this.drugs = [...this.drugs, ...extra];
    }
  }

  addMedicine(): void {
    this.medicines.push(this.createMedicine());
  }

  createMedicine(): FormGroup {
    return this.fb.group({
      id: [null, Validators.required],
      name: [''],
      instructions: [''],
    });
  }

  onDrugSelect(event: any, index: number): void {
    const selectedId = event.value;

    const selectedDrug = this.drugs.find((drug) => drug.id === selectedId);

    if (!selectedDrug) return;

    this.medicines.at(index).patchValue({
      id: selectedDrug.id,
      name: selectedDrug.name,
      instructions: selectedDrug.instructions || selectedDrug.description,
    });
  }

  removeMedicine(index: number): void {
    if (this.medicines.length > 1) {
      this.medicines.removeAt(index);
      console.log(this.medicines.value);
    }
  }

  /** مؤشر بحث صغير جنب خانة السيرش — البحث اللحظي متبقاش له سبينر يغطي الصفحة. */
  isSearchingDrugs = false;

  onSearch(event: any): void {
    this.isSearchingDrugs = true;
    this.prescriptionSearchSubject$.next(event.filter);
  }

  prescriptionSearchSubject() {
    this.prescriptionSearchSubject$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((search) => this.DoctorAuthService.getDrugs(search)),
      )
      .subscribe({
        next: (res) => {
          this.isSearchingDrugs = false;
          // استبدال القائمة كان بيمسح عرض الأدوية المختارة بالفعل في باقي الصفوف
          // (p-select ميعرفش يعرض قيمة مش موجودة في options) — فبنرجّعهم للقائمة.
          this.drugs = res;
          this.ensureDrugsIncludeMedicines(this.medicines.value ?? []);
        },
        error: () => {
          this.isSearchingDrugs = false;
        },
      });
  }

  loadDrugs() {
    this.DoctorAuthService.getDrugs().subscribe((res: any) => {
      this.drugs = res;
      // بعد ما القايمة تجهز نسترجع روشتة الميتينج الحالي (لو موجودة) للتعديل.
      this.prefillFromMeeting();
    });
  }

  submit(): void {
    this.prescriptionForm.patchValue({
      meetingId: this.meetingId,
    });
    if (this.prescriptionForm.invalid) {
      this.prescriptionForm.markAllAsTouched();
      return;
    }

    // POST دايمًا: السيرفر بيعمل upsert على مستوى الميتينج (لو فيه روشتة قبل كدا
    // بيستبدل محتواها). كدا مفيش أي اعتماد على ids متخزنة ممكن تبقى لميتينج تاني.
    this.DoctorAuthService.sendPrescription(
      this.prescriptionForm.value,
    ).subscribe({
      next: () => {
        this.toastr.success('تم حفظ الروشتة بنجاح');
        this.closePrescription.emit();
      },
      error: (err) => {
        const apiError = err?.error;
        this.toastr.error(
          apiError?.message ||
            (typeof apiError === 'string' && apiError ? apiError : 'تعذر حفظ الروشتة'),
        );
      },
    });
  }
}
