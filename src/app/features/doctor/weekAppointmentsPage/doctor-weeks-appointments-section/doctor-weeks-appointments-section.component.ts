import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { DoctorsService } from '../../../../shared/services/doctors.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-doctor-weeks-appointments-section',
  imports: [RouterLink, CommonModule, TranslateModule],
  templateUrl: './doctor-weeks-appointments-section.component.html',
  styleUrl: './doctor-weeks-appointments-section.component.css',
})
export class DoctorWeeksAppointmentsSectionComponent implements OnInit {
  showPopup: boolean = false;

  sessions: any[] = [];

  uniqueDays: any[] = [];
  selectedDate: string | null = null;

  doctorId: number | null = null;
  constructor(
    readonly doctorService: DoctorsService,
    readonly localStorageService: LocalstorageService,
    readonly route: Router,
  ) {}

  ngOnInit() {
    this.doctorId = Number(this.localStorageService.get('doctorId')) || null;
    this.loadTodaysAppointments();
  }

  data: any;
  loadTodaysAppointments() {
    this.doctorService.getAppointmentsWeek(Number(this.doctorId)).subscribe({
      next: (res) => {
        console.log('week:', res);
        this.data = res?.dayAppointments;
        console.log(this.data);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  selectedSessionId: number | null = null;
  openModal(session: any) {
    this.showPopup = true;
    this.selectedSessionId = session.sessionId;
    console.log('sessionId =>', this.selectedSessionId);
  }

  confirmAppointment(appointmentId: number) {
    console.log(appointmentId);

    this.doctorService.confirmAppointment(appointmentId).subscribe({
      next: (res) => {
        console.log(res);
        this.loadTodaysAppointments();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  cancelAppointment(appointmentId: number) {
    this.doctorService
      .cancelAppointment(appointmentId)
      .subscribe((res: any) => {
        console.log(res);
        this.loadTodaysAppointments();
      });
  }

  updateAppointment(appointmentId: number, newSessionId: number) {
    this.doctorService
      .updateAppointment(appointmentId, newSessionId)
      .subscribe((res: any) => {
        console.log(res);
        this.loadTodaysAppointments();
      });
  }

  //

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

  selectedId: number | null = null;
  showModal() {
    this.showPopup = true;
    this.selectedId = this.doctorId;
    this.sessions = [];
    this.uniqueDays = [];
    if (!this.doctorId) return;
    this.doctorService.getSessions(this.doctorId).subscribe({
      next: (res: any[]) => {
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
    console.log('SESSION ID =>', sessionId);
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
    console.log(this.selectedId, this.selectedSessionId);

    if (!this.selectedId || !this.selectedSessionId) return;
  }

  viewMore(item: any) {
    console.log(item);

    this.localStorageService.set('selectedDate', item.date);
    this.localStorageService.set('selectedDay', item.day);

    this.route.navigate(['/doctor/day']);
  }
}
