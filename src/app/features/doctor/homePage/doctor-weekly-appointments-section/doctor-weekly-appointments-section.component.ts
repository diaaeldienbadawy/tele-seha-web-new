import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DoctorsService } from '../../../../shared/services/doctors.service';
import { LocalstorageService } from '../../../../core/services/localstorage.service';

@Component({
  selector: 'app-doctor-weekly-appointments-section',
  imports: [RouterLink],
  templateUrl: './doctor-weekly-appointments-section.component.html',
  styleUrl: './doctor-weekly-appointments-section.component.css',
})
export class DoctorWeeklyAppointmentsSectionComponent {
  doctorId: number | null = null;

  constructor(
    readonly LocalstorageService: LocalstorageService,
    readonly doctorService: DoctorsService,
  ) {}

  ngOnInit() {
    this.doctorId = Number(this.LocalstorageService.get('doctorId')) || null;
    console.log('doctorId:', this.doctorId);
    this.getAppointmentsWeek();
  }

  data: any;

  getAppointmentsWeek() {
    if (this.doctorId) {
      this.doctorService.gethomeAppointments(this.doctorId).subscribe({
        next: (res) => {
          this.data = res.weekAppointmentsCount;
          // console.log('Weekly Appointments:', res);
        },
        error: (err) => {
          console.error('Error fetching weekly appointments:', err);
        },
      });
    }
  }
}
