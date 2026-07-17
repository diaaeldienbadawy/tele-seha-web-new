import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LocalstorageService } from '../../../../../core/services/localstorage.service';
import { DoctorsService } from '../../../../../shared/services/doctors.service';
import { CommonModule } from '@angular/common';
import { DoctorAuthService } from '../../../service/doctor-auth.service';

@Component({
  selector: 'app-book-follow-up',
  imports: [CommonModule],
  templateUrl: './book-follow-up.component.html',
  styleUrl: './book-follow-up.component.css',
})
export class BookFollowUpComponent implements OnInit {
  sessions: any[] = [];
  uniqueDays: any[] = [];
  selectedSessionId: number | null = null;
  appointmentId: number | null = null;

  @Output() closeBookFollowUp = new EventEmitter<void>();

  doctorId: number | null = null;
  selectedDate: string | null = null;
  selectedDay: string | null = null;
  constructor(
    readonly doctorService: DoctorsService,
    readonly doctorAuthService: DoctorAuthService,
    readonly localStorageService: LocalstorageService,
    readonly route: ActivatedRoute,
    readonly router: Router,
    readonly toaster: ToastrService,
  ) {}

  checkUpId!: number;
  patientId!: number;

  ngOnInit() {
    this.doctorId = Number(this.localStorageService.get('doctorId')) || null;
    const agoraDetails = JSON.parse(
      localStorage.getItem('agoraDetails') || '{}',
    );
    this.checkUpId = Number(agoraDetails?.checkUpId);
    this.patientId = Number(this.localStorageService.get('patientId'));

    this.getSession();
  }

  getSession() {
    this.sessions = [];
    this.uniqueDays = [];
    if (!this.doctorId) return;
    this.doctorService.getSessions(this.doctorId).subscribe({
      next: (res: any[]) => {
        console.log(res);

        this.sessions = res;

        this.uniqueDays = Array.from(
          new Map(res.map((s) => [s.date, s])).values(),
        );

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
    // console.log('SESSION ID =>', sessionId);
  }

  getSessionsByDate() {
    return this.sessions.filter((s) => s.date === this.selectedDate);
  }

  getDayName(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  }

  getDayWithMonth(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
    });
  }

  bookingSession() {
    if (!this.patientId || !this.checkUpId) return;

    // Guard: a session must be chosen — otherwise the request 404s on the server and,
    // because the popup used to close first, the doctor thought the follow-up was booked.
    if (!this.selectedSessionId) {
      this.toaster.error('اختر موعدًا للمتابعة أولًا.');
      return;
    }

    const payload = {
      patientId: this.patientId,
      sessionId: this.selectedSessionId,
    };

    this.doctorAuthService.bookingFollowup(payload, this.checkUpId).subscribe({
      next: () => {
        // Close only AFTER the server confirms, and confirm to the doctor.
        this.toaster.success('تم حجز المتابعة بنجاح.');
        this.closeBookFollowUp.emit();
      },
      error: (err) => {
        this.toaster.error(err?.error?.message || 'تعذّر حجز المتابعة.');
      },
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
}
