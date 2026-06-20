import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { Component, OnInit, Optional } from '@angular/core';
import { DoctorAuthService } from '../../service/doctor-auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DatePickerModule } from 'primeng/datepicker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { GlobalUserStateService } from '../../../../core/services/state/global-user-state.service';
import { DoctorRegistrationStateService } from '../../../../core/services/state/doctor-registration-state.service';

export function capacityValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const startTime = control.get('StartTime')?.value;
    const endTime = control.get('EndTime')?.value;
    const capacity = control.get('Capacity')?.value;

    if (!startTime || !endTime || !capacity) return null;

    const parseTime = (timeStr: string) => {
      const match = timeStr.match(/(\d+):(\d+)(?:\s*(AM|PM))?/i);
      if (!match) return 0;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3];

      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
      }
      return hours * 60 + minutes;
    };

    const startMinutes = parseTime(startTime);
    const endMinutes = parseTime(endTime);
    
    let durationMinutes = endMinutes - startMinutes;
    if (durationMinutes < 0) durationMinutes += 24 * 60; // if spans across midnight

    const maxCapacity = Math.floor(durationMinutes / 15);

    if (capacity > maxCapacity) {
      return { capacityExceeded: { max: maxCapacity } };
    }

    return null;
  };
}

@Component({
  selector: 'app-non-recurring-appointments',
  imports: [CommonModule, ReactiveFormsModule, DatePickerModule, NgxMaterialTimepickerModule],
  templateUrl: './non-recurring-appointments.component.html',
  styleUrl: './non-recurring-appointments.component.css',
})
export class NonRecurringAppointmentsComponent implements OnInit {
  form!: FormGroup;
  doctorId!: number;

  today: Date = new Date();

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

  daysMap = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  constructor(
    readonly fb: FormBuilder,
    readonly localStorageService: LocalstorageService,
    readonly globalUserStateService: GlobalUserStateService,
    @Optional() readonly doctorRegistrationStateService: DoctorRegistrationStateService,
    readonly doctorAuthService: DoctorAuthService,
    readonly toastr: ToastrService,
    readonly route: Router,
  ) {}

  ngOnInit(): void {
    this.doctorId = Number(this.globalUserStateService.doctorId() || this.doctorRegistrationStateService?.doctorId() || this.localStorageService.get('doctorId'));
    this.loadDoctorSession();
    this.initForm();
  }
  initForm() {
    this.form = this.fb.group({
      Date: ['', Validators.required],
      Day: [{ value: '', disabled: true }, Validators.required],
      StartTime: ['', Validators.required],
      EndTime: ['', Validators.required],
      Capacity: [null, [Validators.required, Validators.min(1)]],
      DoctorId: [this.doctorId],
    }, { validators: capacityValidator() });

    this.form.get('Date')?.valueChanges.subscribe((dateValue) => {
      if (!dateValue) return;

      const date = new Date(dateValue);
      const dayName = this.daysMap[date.getDay()];

      this.form.patchValue({ Day: dayName });
    });
  }

  schedules: any[] = [];
  loadDoctorSession() {
    this.doctorAuthService.getDoctorSession(this.doctorId).subscribe({
      next: (res) => {
        console.log(res);
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

    const date = new Date(raw.Date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    const body = {
      date: formattedDate,
      start: this.formatTime(raw.StartTime),
      end: this.formatTime(raw.EndTime),
      capacity: Number(raw.Capacity),
      doctorId: this.doctorId,
    };

    // const start = this.formatTime(raw.StartTime);
    // const end = this.formatTime(raw.EndTime);

    // const formData = new FormData();
    // formData.append('Date', raw.Date);
    // formData.append('Start', start);
    // formData.append('End', end);
    // formData.append('Capacity', raw.Capacity.toString());
    // formData.append('DoctorId', raw.DoctorId.toString());

    console.log('SEND TO API JSON', body);

    if (this.sessionId) {
      this.doctorAuthService
        .updateDoctorSession(body, this.sessionId)
        .subscribe({
          next: (res) => {
            console.log('sssssssssssssssssssss');
            console.log(res);
            this.loadDoctorSession();
            this.sessionId = undefined!;
            this.form.reset();
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
      this.doctorAuthService.createDoctorSession(body).subscribe({
        next: (res) => {
          console.log(res);
          this.loadDoctorSession();
          this.form.reset();
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
  // formatTime(time: string): string {
  //   if (!time) return '';

  //   if (time.length === 5) {
  //     return time + ':00';
  //   }

  //   return time;
  // }

  sessionId!: number;
  edit(data: any) {
    console.log(data);

    this.sessionId = data.sessionId;
    if (this.sessionId) {
      const dateObj = (() => {
        if (!data.date) return null;
        const parts = data.date.split('-');
        return parts.length === 3 ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])) : new Date(data.date);
      })();
      const dayName = dateObj ? this.daysMap[dateObj.getDay()] : '';

      this.form.patchValue({
        Date: dateObj,
        Day: dayName,
        StartTime: this.timeToDateStr(data.start),
        EndTime: this.timeToDateStr(data.end),
        Capacity: data.capacity,
      }, { emitEvent: false });
    }
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

    this.doctorAuthService.deleteDoctorSession(id).subscribe({
      next: (res) => {
        console.log(res);
        this.loadDoctorSession();
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
    this.sessionId = undefined!;
  }
}
