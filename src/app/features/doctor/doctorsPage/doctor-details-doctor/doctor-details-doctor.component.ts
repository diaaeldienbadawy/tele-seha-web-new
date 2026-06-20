import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BookingSessionService } from '../../../../shared/services/booking-session.service';
import { DoctorsService } from '../../../../shared/services/doctors.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-doctor-details-doctor',
  imports: [CommonModule, TranslateModule],
  templateUrl: './doctor-details-doctor.component.html',
  styleUrl: './doctor-details-doctor.component.css',
})
export class DoctorDetailsDoctorComponent implements OnInit {
  isBrowser = false;
  doctorId: number | null = null;

  sessions: any[] = [];
  uniqueDays: any[] = [];

  selectedDate: string | null = null;
  selectedSessionId: number | null = null;

  constructor(
    readonly route: ActivatedRoute,
    readonly doctorService: DoctorsService,
    readonly bookingSessionService: BookingSessionService,
    readonly toastr: ToastrService,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.doctorId = Number(this.route.snapshot.paramMap.get('id'));
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    console.log('doctorId:', this.doctorId);

    this.loadDoctorDetails();
  }

  data: any;
  loadDoctorDetails() {
    if (this.doctorId) {
      this.doctorService.getDoctorProfile(this.doctorId).subscribe({
        next: (res) => {
          console.log(res);
          this.data = res.data;
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }

  formatTime(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
}
