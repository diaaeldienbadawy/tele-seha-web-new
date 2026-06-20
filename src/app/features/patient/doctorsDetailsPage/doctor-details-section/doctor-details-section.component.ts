import { patinet } from './../../patient.routes';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DoctorsService } from '../../../../shared/services/doctors.service';
import { BookingSessionService } from '../../../../shared/services/booking-session.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-doctor-details-section',
  imports: [CommonModule, TranslateModule],
  templateUrl: './doctor-details-section.component.html',
  styleUrl: './doctor-details-section.component.css',
})
export class DoctorDetailsSectionComponent implements OnInit {
  showPopup: boolean = false;
  isBrowser = false;
  doctorId: number | null = null;
  patinetId!: number;

  sessions: any[] = [];
  uniqueDays: any[] = [];

  selectedDate: string | null = null;
  selectedSessionId: number | null = null;

  constructor(
    readonly route: ActivatedRoute,
    readonly doctorService: DoctorsService,
    readonly bookingSessionService: BookingSessionService,
    readonly toastr: ToastrService,
    readonly localStorageService : LocalstorageService,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.doctorId = Number(this.route.snapshot.paramMap.get('doctorId'));
    this.patinetId = Number(this.localStorageService.get('patientId'));
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    console.log('doctorId:', this.doctorId);

    this.loadDoctorDetails();
  }

  groupedSchedules: {
    day: string;
    times: { startTime: string; endTime: string }[];
  }[] = [];

  data: any;
  loadDoctorDetails() {
    if (this.doctorId) {
      this.doctorService.getDoctorProfile(this.doctorId).subscribe({
        next: (res) => {
          console.log(res);
          this.data = res.data;
          const schedules = this.data?.schedules || [];
          const map = new Map<
            string,
            { startTime: string; endTime: string }[]
          >();

          schedules.forEach((item: any) => {
            if (!map.has(item.day)) {
              map.set(item.day, []);
            }
            map
              .get(item.day)
              ?.push({ startTime: item.startTime, endTime: item.endTime });
          });

          this.groupedSchedules = Array.from(map, ([day, times]) => ({
            day,
            times,
          }));
        },
        error: (err) => console.log(err),
      });
    }
  }

  showModal() {
    this.showPopup = true;
    if (!this.doctorId) return;
    this.sessions = [];
    this.uniqueDays = [];
    this.doctorService.getSessions(this.doctorId).subscribe({
      next: (res: any[]) => {
        this.sessions = res;

        // 👇 أيام بدون تكرار
        this.uniqueDays = Array.from(
          new Map(res.map((s) => [s.date, s])).values(),
        );

        // 👇 اختيار أول يوم تلقائي
        if (this.uniqueDays.length) {
          this.selectDay(this.uniqueDays[0].date);
        }
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
        this.sessions = [];
        this.uniqueDays = [];
      },
    });
  }

  selectDay(date: string) {
    this.selectedDate = date;
    this.selectedSessionId = null;
  }

  selectSession(sessionId: number) {
    this.selectedSessionId = sessionId;
    console.log('SESSION ID =>', sessionId);
  }

  getSessionsByDate() {
    return this.sessions.filter((s) => s.date === this.selectedDate);
  }

  getDayName(date: string): string {
    const lang = this.localStorageService.get('lang') || 'en';
    return new Date(date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long' });
  }

  getDayWithMonth(date: string): string {
    const lang = this.localStorageService.get('lang') || 'en';
    return new Date(date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      day: '2-digit',
      month: 'short',
    });
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

  bookingSession() {
    console.log(this.patinetId, this.selectedSessionId);

    if (!this.patinetId || !this.selectedSessionId) return;
    this.bookingSessionService
      .bookingSession(this.patinetId, this.selectedSessionId)
      .subscribe({
        next: (res: any) => {
          console.log(res);
          this.toastr.success(res.message || 'Session Booked Successfully');
          this.showPopup = false;
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
