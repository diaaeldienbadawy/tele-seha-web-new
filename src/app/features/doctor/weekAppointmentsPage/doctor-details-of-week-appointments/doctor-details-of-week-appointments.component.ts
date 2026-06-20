import { Component } from '@angular/core';
import { DoctorsService } from '../../../../shared/services/doctors.service';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doctor-details-of-week-appointments',
  imports: [CommonModule],
  templateUrl: './doctor-details-of-week-appointments.component.html',
  styleUrl: './doctor-details-of-week-appointments.component.css',
})
export class DoctorDetailsOfWeekAppointmentsComponent {
 
}
