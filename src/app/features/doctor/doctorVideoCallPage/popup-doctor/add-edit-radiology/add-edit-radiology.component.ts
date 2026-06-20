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
import { LocalstorageService } from '../../../../../core/services/localstorage.service';
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

  readonly localstorageService = inject(LocalstorageService);

  radiologyId!: number;

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

    this.radiologyId = Number(this.localstorageService.get('radiologyId'));

    console.log('radiologyId', this.radiologyId);

    if (this.radiologyId) {
      this.getRadiologyById(this.radiologyId);
    }
  }

  getRadiologyById(id: number) {
    this.DoctorAuthService.getRadiologyById(id).subscribe({
      next: (res: any) => {
        console.log('etRadiologyById', res);

        this.radiologyForm.patchValue({
          meetingId: res.meetingId,
          notes: res.notes || '',
        });

        const examinationsArray = this.radiologyMedicines;
        examinationsArray.clear();

        (res.radiologicalExaminations || []).forEach((exam: any) => {
          examinationsArray.push(
            this.fb.group({
              id: [exam.id, Validators.required],
              name: [exam.name],
              position: [exam.position || ''],
              notes: [exam.notes || ''],
            }),
          );
        });
      },
      error: (err) => console.log(err),
    });
  }

  initRadiologyForm(): void {
    this.radiologyForm = this.fb.group({
      meetingId: [null, Validators.required],
      examinations: this.fb.array([this.createRadiology()]),
      notes: [''],
    });
  }

  radiologySearchSubject() {
    this.radiologySearchSubject$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((search) => this.DoctorAuthService.getRadiology(search)),
      )
      .subscribe((res) => {
        this.radiology = res;
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

    console.log('Final Payload:', this.radiologyForm.value);

    this.closeRadiology.emit();

    if (this.radiologyId) {
      this.DoctorAuthService.updateRadiology(
        this.radiologyForm.value,
        this.radiologyId,
      ).subscribe({
        next: (res) => {
          console.log(res);
          this.toastr.success('Radiology updated successfully');
        },
        error: (err) => {
          console.log(err.error.message);
          this.toastr.error(err.error.message || 'Error updating radiology');
        },
      });
    } else {
      this.DoctorAuthService.sendRadiology(this.radiologyForm.value).subscribe({
        next: (res) => {
          console.log(res);
          this.toastr.success('Radiology submitted successfully');
          this.localstorageService.set('radiologyId', res.id);
        },
        error: (err) => {
          console.log(err.error.message);
          this.toastr.error(err.error.message || 'Failed to submit radiology');
        },
      });
    }
  }
}
