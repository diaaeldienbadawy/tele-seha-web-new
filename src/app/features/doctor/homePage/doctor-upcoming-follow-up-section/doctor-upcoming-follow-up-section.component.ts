import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { DoctorsService } from '../../../../shared/services/doctors.service';

@Component({
  selector: 'app-doctor-upcoming-follow-up-section',
  imports: [RouterLink],
  templateUrl: './doctor-upcoming-follow-up-section.component.html',
  styleUrl: './doctor-upcoming-follow-up-section.component.css',
})
export class DoctorUpcomingFollowUpSectionComponent {
  doctorId: number | null = null;

  constructor(
    readonly LocalstorageService: LocalstorageService,
    readonly doctorService: DoctorsService,
  ) {}

  ngOnInit() {
    this.doctorId = Number(this.LocalstorageService.get('doctorId')) || null;
    console.log('doctorId:', this.doctorId);
    this.getFollowUpAppointments();
  }

  data: any;

  getFollowUpAppointments() {
    if (this.doctorId) {
      this.doctorService.gethomeAppointments(this.doctorId).subscribe({
        next: (res) => {
          this.data = res.followUpsCount;
          console.log('Follow Up Appointments:', res);
        },
        error: (err) => {
          console.error('Error fetching follow up appointments:', err);
        },
      });
    }
  }
}
