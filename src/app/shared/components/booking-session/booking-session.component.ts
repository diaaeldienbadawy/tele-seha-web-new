import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BookingSessionService } from '../../services/booking-session.service';
import { DoctorsService } from '../../services/doctors.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-booking-session',
  imports: [CommonModule, TranslateModule],
  templateUrl: './booking-session.component.html',
  styleUrl: './booking-session.component.css',
})
export class BookingSessionComponent implements OnChanges {
  @Input() doctorId!: number | null;
  @Input() patientId!: string | null;
  @Input() showPopup: boolean = false;

  @Output() close = new EventEmitter<void>();

  sessions: any[] = [];
  uniqueDays: any[] = [];

  selectedDate: string | null = null;
  selectedSessionId: number | null = null;

  constructor(
    private doctorsService: DoctorsService,
    private bookingSessionService: BookingSessionService,
    private toastr: ToastrService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['doctorId'] && this.doctorId && this.showPopup) {
      this.loadSessions();
    }
  }

  loadSessions() {
    this.sessions = [];
    this.uniqueDays = [];
    this.doctorsService.getSessions(this.doctorId!).subscribe({
      next: (res: any[]) => {
        /* 1️⃣ ترتيب كل السشنز بالتاريخ ثم الوقت */
        this.sessions = res.sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.start}`).getTime();
          const dateB = new Date(`${b.date} ${b.start}`).getTime();

          return dateA - dateB;
        });

        /* 2️⃣ استخراج الأيام بدون تكرار بعد الترتيب */
        this.uniqueDays = Array.from(
          new Map(this.sessions.map((s) => [s.date, s])).values(),
        );

        /* 3️⃣ اختيار أول يوم */
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
  }

  getSessionsByDate() {
    return this.sessions.filter((s) => s.date === this.selectedDate);
  }

  getLang(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lang') === 'ar' ? 'ar-EG' : 'en-US';
    }
    return 'en-US';
  }

  getDayName(date: string): string {
    return new Date(date).toLocaleDateString(this.getLang(), { weekday: 'long' });
  }

  getDayWithMonth(date: string): string {
    return new Date(date).toLocaleDateString(this.getLang(), {
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
    console.log('this.patientId, this.selectedSessionId');
    console.log(this.patientId, this.selectedSessionId);

    if (!this.patientId || !this.selectedSessionId) return;

    console.log('this.patientId, this.selectedSessionId');
    console.log(this.patientId, this.selectedSessionId);

    this.bookingSessionService
      .bookingSession(Number(this.patientId), this.selectedSessionId)
      .subscribe({
        next: (res: any) => {
          console.log(res);

          this.toastr.success(res.message || 'Session Booked Successfully');
          this.closeModal();
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

  closeModal() {
    this.close.emit();
    this.selectedSessionId = null;
    this.selectedDate = null;
  }
}
