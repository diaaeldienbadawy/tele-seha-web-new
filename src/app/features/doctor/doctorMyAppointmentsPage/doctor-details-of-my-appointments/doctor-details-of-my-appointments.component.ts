import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { DoctorsService } from '../../../../shared/services/doctors.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-doctor-details-of-my-appointments',
  imports: [RouterLink, CommonModule, TranslateModule],
  templateUrl: './doctor-details-of-my-appointments.component.html',
  styleUrl: './doctor-details-of-my-appointments.component.css',
})
export class DoctorDetailsOfMyAppointmentsComponent implements OnInit {
  doctorId: string | null = null;
  weekNumber: number | null = null;
  constructor(
    readonly doctorService: DoctorsService,
    readonly localStorageService: LocalstorageService,
    readonly router: Router,
    readonly route: ActivatedRoute,
  ) {}
  showPopup: boolean = false;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.weekNumber = Number(params.get('id'));
    });
    this.doctorId = this.localStorageService.get('doctorId') || null;

    console.log(this.doctorId, this.weekNumber);

    this.getAppointmentsWeekNumber();
  }

  data: any[] = [];
  getAppointmentsWeekNumber() {
    if (!this.weekNumber) return;
    console.log('sssssssssssssssssssssss');

    this.doctorService
      .getAppointmentsWeekNumber(this.weekNumber, Number(this.doctorId))
      .subscribe({
        next: (res) => {
          if (!res) {
            console.log('No appointments this week');
            this.data = [];
            return;
          }

          this.data = res.dayAppointments;
        },
        // this.data = res.dayAppointments;
        error: (err) => {
          console.log(err);
        },
      });
  }

  viewMore(item: any) {
    console.log(item);

    this.localStorageService.set('selectedDate', item.date);
    this.localStorageService.set('selectedDay', item.day);
    this.router.navigate(['/doctor/day']);
  }

  openModal() {
    this.showPopup = true;
  }
}
