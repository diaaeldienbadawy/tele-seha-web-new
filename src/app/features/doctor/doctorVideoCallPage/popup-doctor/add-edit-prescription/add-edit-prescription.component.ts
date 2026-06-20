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
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { LocalstorageService } from '../../../../../core/services/localstorage.service';
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
  readonly localstorageService = inject(LocalstorageService);
  prescriptionId!: number;

  @Output() closePrescription = new EventEmitter<void>();

  meetingId!: number;
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.meetingId = +params['meetingId'];
    });
    console.log(this.meetingId);

    // Prescription
    this.loadDrugs();
    this.initPrescriptionForm();
    this.prescriptionSearchSubject();

    this.prescriptionId = Number(
      this.localstorageService.get('prescriptionId'),
    );

    // if (this.prescriptionId) {
    //   this.getPrescriptionById(this.prescriptionId);
    // }
  }

  getPrescriptionById(prescriptionId: number): void {
    this.DoctorAuthService.getPrescriptionById(prescriptionId).subscribe({
      next: (res) => {
        console.log('etPrescriptionById', res);
        console.log(res);


        // ✅ patch normal fields
        this.prescriptionForm.patchValue({
          meetingId: res.meetingId,
          notes: res.notes || '',
        });

        // ✅ rebuild medicines array
        const medicinesArray = this.medicines;

        // p-select only shows a value if it exists in [options]; merge so every saved id resolves
        this.ensureDrugsIncludeMedicines(res.medicines ?? []);

        medicinesArray.clear(); // مهم جدا

        (res.medicines ?? []).forEach((medicine: any) => {
          medicinesArray.push(
            this.fb.group({
              id: [medicine.id],
              name: [medicine.name],
              instructions: [medicine.instructions],
            }),
          );
        });
      },
      error: (err) => console.log(err),
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

  onSearch(event: any): void {
    this.prescriptionSearchSubject$.next(event.filter);
  }

  prescriptionSearchSubject() {
    this.prescriptionSearchSubject$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((search) => this.DoctorAuthService.getDrugs(search)),
      )
      .subscribe((res) => {
        this.drugs = res;
      });
  }

  loadDrugs() {
    this.DoctorAuthService.getDrugs().subscribe((res: any) => {
      this.drugs = res;

      if (this.prescriptionId) {
        this.getPrescriptionById(this.prescriptionId);
      }
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

    console.log('Final Payload:', this.prescriptionForm.value);

    this.closePrescription.emit();

    if (this.prescriptionId) {
      this.DoctorAuthService.updatePrescription(
        this.prescriptionForm.value,
        this.prescriptionId,
      ).subscribe({
        next: (res) => {
          console.log(res);
          this.toastr.success('Prescription updated successfully');
        },
        error: (err) => {
          console.log(err);
          this.toastr.error(
            err.error.message || 'Failed to update prescription',
          );
        },
      });
    } else {
      this.DoctorAuthService.sendPrescription(
        this.prescriptionForm.value,
      ).subscribe({
        next: (res) => {
          console.log(res);
          this.localstorageService.set('prescriptionId', res.id);
          this.toastr.success('Prescription submitted successfully');
        },
        error: (err) => {
          console.log(err);
          this.toastr.error(
            err.error.message || 'Failed to submit prescription',
          );
        },
      });
    }
  }
}
