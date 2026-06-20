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
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { LocalstorageService } from '../../../../../core/services/localstorage.service';
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

  readonly localstorageService = inject(LocalstorageService);

  labTestId!: number;

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

    this.labTestId = Number(this.localstorageService.get('labTestId'));

    console.log('labTestId', this.labTestId);

    if (this.labTestId) {
      this.getLabTestById(this.labTestId);
    }
  }

  getLabTestById(id: number) {
    this.DoctorAuthService.getLabById(id).subscribe({
      next: (res: any) => {
        console.log('etLabTestById', res);

        this.labTestForm.patchValue({
          meetingId: res.meetingId,
          notes: res.notes || '',
        });

        const labArray = this.labTestMedicines;

        labArray.clear();

        res.labAnalyses.forEach((lab: any) => {
          labArray.push(
            this.fb.group({
              id: [lab.id, Validators.required],
              name: [lab.name],
              position: [lab.position || ''],
              notes: [lab.notes || ''],
            }),
          );
        });
      },
      error: (err) => console.log(err),
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
  labTestSearchSubject() {
    this.labTestSearchSubject$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((search) => this.DoctorAuthService.getLabTest(search)),
      )
      .subscribe((res) => {
        this.labTest = res;
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

    console.log('Final Payload:', this.labTestForm.value);

    this.closeLab.emit();

    if (this.labTestId) {
      this.DoctorAuthService.updateLab(
        this.labTestForm.value,
        this.labTestId,
      ).subscribe({
        next: (res) => {
          console.log(res);
          this.toastr.success('Lab Test updated successfully');
        },
        error: (err) => {
          console.log(err.error.message);
          this.toastr.error(err.error.message || 'Error updating lab test');
        },
      });
    } else {
      this.DoctorAuthService.sendLab(this.labTestForm.value).subscribe({
        next: (res) => {
          console.log(res);
          this.toastr.success('Lab Test submitted successfully');
          this.localstorageService.set('labTestId', res.id);
        },
        error: (err) => {
          console.log(err);
          this.toastr.error(err.error.message || 'Error submitting lab test');
        },
      });
    }
  }
}
