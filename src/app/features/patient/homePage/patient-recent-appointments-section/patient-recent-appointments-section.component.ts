import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { RecentAppointmentsService } from '../../../../shared/services/recent-appointments.service';

import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-patient-recent-appointments-section',
  imports: [RouterLink, TranslateModule, CommonModule],
  templateUrl: './patient-recent-appointments-section.component.html',
  styleUrl: './patient-recent-appointments-section.component.css',
})
export class PatientRecentAppointmentsSectionComponent implements OnInit {
  patientId: string | null = null;
  constructor(
    readonly localStorageService: LocalstorageService,
    readonly recentAppointmentService: RecentAppointmentsService,
  ) {
    this.patientId = this.localStorageService.loggedInPatientId() || null;
  }

  ngOnInit(): void {
    this.loadAppointmentComming();
  }

  data: any;
  loadAppointmentComming() {
    if (!this.patientId) return;
    console.log(this.patientId);

    this.recentAppointmentService
      .appointmentCheckComming(Number(this.patientId))
      .subscribe({
        next: (res) => {
          console.log(" ------------------");
          console.log(res);
          this.data = res;
        },
      });
  }

  getRemainingMinutes(dateTime?: string): number {
    if (!dateTime) return 0;

    const now = Date.now();
    const target = new Date(dateTime).getTime();

    const diffMinutes = Math.floor((target - now) / (1000 * 60));

    return diffMinutes > 0 ? diffMinutes : 0;
  }
}
