import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DoctorsService } from '../../../../shared/services/doctors.service';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-doctor-my-appointments-section',
  imports: [RouterLink, CommonModule, TranslateModule],
  templateUrl: './doctor-my-appointments-section.component.html',
  styleUrl: './doctor-my-appointments-section.component.css',
})
export class DoctorMyAppointmentsSectionComponent implements OnInit {
  doctorId: string | null = null;
  constructor(
    readonly doctorService: DoctorsService,
    readonly localStorageService: LocalstorageService,
    readonly route : Router
  ) {}

  ngOnInit() {
    this.doctorId = this.localStorageService.get('doctorId') || null;
    this.getAllAppointments();
  }

  data: any;
  getAllAppointments() {
    this.doctorService.getAllAppointments(Number(this.doctorId)).subscribe({
      next: (res) => {
        // console.log(res);
        this.data = res;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  viewMore(weekNumber: any) {
    console.log(weekNumber);

    this.route.navigate(['/doctor/myAppointments'  ,weekNumber]);

  }

}
