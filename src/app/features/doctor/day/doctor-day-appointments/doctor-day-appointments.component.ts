import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { DoctorsService } from '../../../../shared/services/doctors.service';
import { PatientAppointmentStatus } from '../../../../core/enum/patientAppointmentStatus';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-doctor-day-appointments',
  imports: [CommonModule, TranslateModule],
  templateUrl: './doctor-day-appointments.component.html',
  styleUrl: './doctor-day-appointments.component.css',
})
export class DoctorDayAppointmentsComponent {
  showPopup: boolean = false;

  sessions: any[] = [];
  uniqueDays: any[] = [];
  selectedSessionId: number | null = null;
  appointmentId: number | null = null;

  doctorId: number | null = null;
  selectedDate: string | null = null;
  selectedDay: string | null = null;
  weekId: string | null = null;
  constructor(
    readonly doctorService: DoctorsService,
    readonly localStorageService: LocalstorageService,
    readonly route: ActivatedRoute,
    readonly router: Router,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.weekId = params.get('id');
    });

    this.doctorId = Number(this.localStorageService.get('doctorId')) || null;
    this.selectedDate = this.localStorageService.get('selectedDate') || null;
    this.selectedDay = this.localStorageService.get('selectedDay') || null;
    console.log(this.doctorId, this.selectedDate, this.selectedDay);

    this.selectedMeetingId = this.localStorageService.get('meetingId') || null;

    this.getAppointmentsDay();
  }

  data: any;
  allAppointments: any;
  getAppointmentsDay() {
    // getAppointmentsDay
    if (!this.selectedDate || !this.doctorId) return;
    this.doctorService
      .getAppointmentsDay(this.selectedDate, Number(this.doctorId))
      .subscribe({
        next: (res: any) => {
          console.log('weedgsdfgfkId:', res);
          console.log(res);
          this.data = res;
          this.allAppointments = res.map((session: any) => ({
            sessionId: session.sessionId,
            sessionStart: session.start,
            appointments: session.appointments || [],
          }));
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  hasAppointments(): boolean {
    return this.allAppointments?.some(
      (session: any) => session.appointments?.length > 0,
    );
  }

  confirmAppointment(appointmentId: number) {
    console.log(appointmentId);
    this.doctorService
      .confirmAppointment(appointmentId)
      .subscribe((res: any) => {
        // console.log(res);
        this.getAppointmentsDay();
      });
  }

  cancelAppointment(appointmentId: number) {
    console.log('Canceling appointment with ID:', appointmentId);

    this.doctorService
      .cancelAppointment(appointmentId)
      .subscribe((res: any) => {
        // console.log(res);
        this.getAppointmentsDay();
      });
  }

  updateAppointment(appointmentId: number, newSessionId: number) {
    this.doctorService
      .updateAppointment(appointmentId, newSessionId)
      .subscribe((res: any) => {
        // console.log(res);
        this.getAppointmentsDay();
      });
  }

  selectedMeetingId: number | null | string = null;
  openMeeting(appointmentId: number) {
    this.doctorService.openAppointment(appointmentId).subscribe((res: any) => {
      console.log(res);
      this.selectedMeetingId = res.id;
      this.getAppointmentsDay();
      this.localStorageService.set('meetingId', res.id);
      this.localStorageService.set('channelName', res.channelName);
      this.localStorageService.set('checkUpId', res.checkUp.id);
      this.localStorageService.set('patientId', res.checkUp.patientId);
      this.localStorageService.set(
        'medicalHistory',
        JSON.stringify(res.patient.sections),
      );
      this.localStorageService.set('meetingToken', res.providerToken);
      this.localStorageService.set('agoraDetails', JSON.stringify(res));
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

  selectedId: number | null = null;
  showModal(appointment: any) {
    this.appointmentId = appointment.id;
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
    console.log(this.appointmentId);
    console.log(this.selectedSessionId);

    if (!this.appointmentId || !this.selectedSessionId) return;

    console.log(
      'Booking session with appointment ID:',
      this.appointmentId,
      'and session ID:',
      this.selectedSessionId,
    );

    this.doctorService
      .updateAppointment(this.appointmentId, this.selectedSessionId)
      .subscribe({
        next: (res: any) => {
          console.log(res);
          this.getAppointmentsDay();
          this.showPopup = false;
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  getButtonText(status: PatientAppointmentStatus): string {
    switch (status) {
      case PatientAppointmentStatus.Created:
        return 'doctorStatus.confirm';
      case PatientAppointmentStatus.Confirmed:
        return 'doctorStatus.waitingPayment';
      case PatientAppointmentStatus.CreateComplaint:
        return 'doctorStatus.open';
      case PatientAppointmentStatus.Pending:
        return 'doctorStatus.start';
      case PatientAppointmentStatus.Started:
        return 'doctorStatus.join';
      case PatientAppointmentStatus.Rescheduled:
        return 'doctorStatus.rescheduled';
      case PatientAppointmentStatus.Completed:
        return 'doctorStatus.completed';
      case PatientAppointmentStatus.Canceled:
        return 'doctorStatus.canceled';
      default:
        return 'doctorStatus.action';
    }
  }

  isDisabled(status: PatientAppointmentStatus): boolean {
    return [
      PatientAppointmentStatus.Confirmed,
      PatientAppointmentStatus.Rescheduled,
      PatientAppointmentStatus.Completed,
      PatientAppointmentStatus.Canceled,
    ].includes(status);
  }

  getButtonClass(status: PatientAppointmentStatus): string {
    switch (status) {
      case PatientAppointmentStatus.Created:
        return 'bg-[#007BBD] hover:bg-[#006ba5] text-white shadow-md transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200';
      case PatientAppointmentStatus.CreateComplaint:
      case PatientAppointmentStatus.Pending:
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200';
      case PatientAppointmentStatus.Started:
        return 'bg-indigo-600 hover:bg-indigo-700 text-white animate-pulse shadow-md transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200';
      default:
        return 'bg-gray-200 text-gray-400 cursor-not-allowed';
    }
  }

  handleAction(item: any) {
    console.log('ssssssssssssssssssssssssssssss');
    console.log(item.id);

    switch (item.status) {
      case PatientAppointmentStatus.Created:
        this.confirmAppointment(item.id);
        break;

      case PatientAppointmentStatus.CreateComplaint:
        // this.createComplaint(item);
        this.openMeeting(item.id);

        break;

      case PatientAppointmentStatus.Pending:
        // this.startSession(item);
        this.openMeeting(item.id);

        break;

      case PatientAppointmentStatus.Started:
        this.localStorageService.set('meetingId', item.checkUp.meetings[0].id);
        this.localStorageService.set(
          'channelName',
          item.checkUp.meetings[0].channelName,
        );
        this.localStorageService.set('checkUpId', item.checkUp.meetings[0].id);
        this.localStorageService.set('patientId', item.patient.patientId);
        this.localStorageService.set(
          'medicalHistory',
          JSON.stringify(item.patient.sections),
        );

        this.localStorageService.set(
          'meetingToken',
          item.checkUp.meetings[0].providerToken,
        );
        this.localStorageService.set(
          'agoraDetails',
          JSON.stringify(item.checkUp.meetings[0]),
        );
        this.router.navigate([
          `/doctor/videoCall/${item.checkUp.meetings[0].id}`,
        ]);
        break;
    }
  }
}
