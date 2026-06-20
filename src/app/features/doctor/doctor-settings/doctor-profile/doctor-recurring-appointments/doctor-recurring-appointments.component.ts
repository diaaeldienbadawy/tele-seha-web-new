import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DatePickerModule } from 'primeng/datepicker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { Select } from 'primeng/select';
import { LocalstorageService } from '../../../../../core/services/localstorage.service';
import { DoctorAuthService } from '../../../service/doctor-auth.service';
import { combineLatest, startWith } from 'rxjs';

@Component({
  selector: 'app-doctor-recurring-appointments',
  imports: [ReactiveFormsModule, CommonModule, Select, DatePickerModule, NgxMaterialTimepickerModule],
  templateUrl: './doctor-recurring-appointments.component.html',
  styleUrl: './doctor-recurring-appointments.component.css',
})
export class DoctorRecurringAppointmentsComponent implements OnInit {
  form!: FormGroup;
  doctorId!: number;

  days = [
    { name: 'Sunday', value: 'Sunday' },
    { name: 'Monday', value: 'Monday' },
    { name: 'Tuesday', value: 'Tuesday' },
    { name: 'Wednesday', value: 'Wednesday' },
    { name: 'Thursday', value: 'Thursday' },
    { name: 'Friday', value: 'Friday' },
    { name: 'Saturday', value: 'Saturday' },
  ];

  timepickerTheme = {
    container: {
        bodyBackgroundColor: '#fff',
        buttonColor: 'var(--primary-color)'
    },
    dial: {
        dialBackgroundColor: 'var(--primary-color)',
    },
    clockFace: {
        clockFaceBackgroundColor: '#f1f5f9',
        clockHandColor: 'var(--primary-color)',
        clockFaceTimeInactiveColor: '#475569'
    }
  };

  constructor(
    readonly fb: FormBuilder,
    readonly localStorageService: LocalstorageService,
    readonly doctorAuthService: DoctorAuthService,
    readonly route: Router,
    readonly toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.doctorId = Number(this.localStorageService.get('doctorId'));
    this.loadDoctorSchedule();
    this.initForm();
    this.listenToTimeChanges();
  }

  private parseTimeToMinutes(time: any): number | null {
    if (!time) return null;

    if (time instanceof Date) {
      return time.getHours() * 60 + time.getMinutes();
    }

    if (typeof time === 'string') {
      const match = time.match(/(\d+):(\d+)(?::\d+)?\s*(AM|PM)?/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const ampm = match[3];

        if (ampm) {
          if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
          if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
        }
        return hours * 60 + minutes;
      }
    }

    return null;
  }

  listenToTimeChanges() {
    const startControl = this.form.get('StartTime')!;
    const endControl = this.form.get('EndTime')!;

    combineLatest([
      startControl.valueChanges.pipe(startWith(startControl.value)),
      endControl.valueChanges.pipe(startWith(endControl.value)),
    ]).subscribe(([start, end]) => {
      if (!start || !end) return;

      const startMinutes = this.parseTimeToMinutes(start);
      const endMinutes = this.parseTimeToMinutes(end);

      if (startMinutes === null || endMinutes === null) return;

      let diff = endMinutes - startMinutes;
      if (diff < 0) {
        diff += 24 * 60; // if spans across midnight
      }

      if (diff <= 0) {
        this.form.patchValue({ Capacity: null }, { emitEvent: false });
        return;
      }

      const capacity = Math.floor(diff / 30);

      this.form.patchValue({ Capacity: capacity }, { emitEvent: false });
    });
  }
  initForm() {
    this.form = this.fb.group({
      Day: ['', Validators.required],
      StartTime: ['', Validators.required],
      EndTime: ['', Validators.required],
      Capacity: [null, [Validators.required, Validators.min(1)]],
      DoctorId: [this.doctorId],
    });
  }

  schedules: any[] = [];
  loadDoctorSchedule() {
    this.doctorAuthService.getDoctorSchedule(this.doctorId).subscribe({
      next: (res) => {
        // console.log(res);
        this.schedules = res;
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

  formatTime(date: any): string {
    if (!date) return '';

    if (typeof date === 'string') {
      const match = date.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        const ampm = match[3];

        if (ampm) {
          if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
          if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
        }
        return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
      }
      return date;
    }

    const d = new Date(date);

    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}:00`;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const body = {
      day: raw.Day,
      startTime: this.formatTime(raw.StartTime),
      endTime: this.formatTime(raw.EndTime),
      capacity: Number(raw.Capacity),
      doctorId: Number(this.doctorId),
    };

    console.log('FORM VALUE TO SEND:', body);

    if (this.doctorScheduleId) {
      this.doctorAuthService
        .updateDoctorSchedule(body, this.doctorScheduleId)
        .subscribe({
          next: (res) => {
            console.log('sssssssssssssssssssss');
            console.log(res);
            this.toastr.success('Updated Successfully');
            this.loadDoctorSchedule();
            this.doctorScheduleId = undefined!;
            this.form.reset({
              DoctorId: this.doctorId,
            });
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
    } else {
      this.doctorAuthService.createDoctorSchedule(body).subscribe({
        next: (res) => {
          console.log(res);
          this.toastr.success('Created Successfully');
          this.loadDoctorSchedule();
          this.form.reset({
            DoctorId: this.doctorId,
          });
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
  }

  doctorScheduleId!: number;
  edit(data: any) {
    console.log(data);

    this.doctorScheduleId = data.doctorScheduleId;
    this.form.patchValue({
      Day: data.day,
      StartTime: this.timeToDateStr(data.startTime),
      EndTime: this.timeToDateStr(data.endTime),
      Capacity: data.capacity,
    }, { emitEvent: false });
  }

  private timeToDateStr(time: string): string {
    if (!time) return '';
    const parts = time.split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    return `${hours.toString().padStart(2, '0')}:${minutes.padStart(2, '0')} ${ampm}`;
  }

  deleted(id: number) {
    console.log(id);

    this.doctorAuthService.deleteDoctorSchedule(id).subscribe({
      next: (res) => {
        console.log('deleted');
        console.log(res);
        this.toastr.success('Deleted Successfully');
        this.loadDoctorSchedule();
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

  goHome() {
    this.route.navigate(['/doctor/home']);
  }

  formatedTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(+hours, +minutes);

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  cancel() {
    this.form.reset();
    this.doctorScheduleId = undefined!;
  }
}
