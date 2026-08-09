import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { RecentAppointmentsService } from '../../../../shared/services/recent-appointments.service';

import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '../../../patient/service/notification.service';

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
    readonly notificationService: NotificationService,
  ) {
    this.patientId = this.localStorageService.loggedInPatientId() || null;
  }

  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.loadAppointmentComming();

    // الاتصال بيتفتح من الهيدر على كل صفحة، بس بنطلبه هنا كمان (idempotent) عشان
    // فتح الصفحة مباشرة/refresh يفضل عليه realtime.
    if (this.patientId) {
      this.notificationService.startPatientConnection(this.patientId);
    }

    // Real-time appointment updates. takeUntilDestroyed: من غيره الاشتراك كان
    // بيتراكم مع كل دخول للصفحة فكل حدث بيعمل نفس الطلب كذا مرة.
    this.notificationService.appointmentEvents$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadAppointmentComming();
      });
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
