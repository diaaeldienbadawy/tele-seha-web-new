import { doctor } from './../../doctor.routes';
import { LocalstorageService } from './../../../../core/services/localstorage.service';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DoctorsService } from '../../../../shared/services/doctors.service';

@Component({
  selector: 'app-doctor-today-appointments-section',
  imports: [RouterLink],
  templateUrl: './doctor-today-appointments-section.component.html',
  styleUrl: './doctor-today-appointments-section.component.css',
})
export class DoctorTodayAppointmentsSectionComponent {
  doctorId: number | null = null;

  constructor(
    readonly LocalstorageService: LocalstorageService,
    readonly doctorService: DoctorsService,
  ) {}

  ngOnInit() {
    this.doctorId = Number(this.LocalstorageService.get('doctorId')) || null;
    // console.log('doctorId:', this.doctorId);
    this.getTodayAppointments();
  }

  data: any;

  getTodayAppointments() {
    if (this.doctorId) {
      this.doctorService.gethomeAppointments(this.doctorId).subscribe({
        next: (res) => {
          this.data = res.toDayAppointmentsCount;
          // console.log('Today Appointments:', res);
        },
        error: (err) => {
          console.error('Error fetching today appointments:', err);
        },
      });
    }
  }
}
