import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../../patient/service/notification.service';
import { GlobalUserStateService } from '../../../../core/services/state/global-user-state.service';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { FooterComponent } from '../../../../layouts/footer/footer.component';
import { DoctorsService } from '../../../../shared/services/doctors.service';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { PatientAppointmentStatus } from '../../../../core/enum/patientAppointmentStatus';
import { BookingSessionComponent } from '../../../../shared/components/booking-session/booking-session.component';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateServiceService } from '../../../../core/services/translate-service.service';

@Component({
  selector: 'app-doctor-home-page',
  imports: [
    CommonModule,
    RouterLink,
    HeaderComponent,
    FooterComponent,
    BookingSessionComponent,
    TranslateModule,
  ],
  templateUrl: './doctor-home-page.component.html',
  styleUrl: './doctor-home-page.component.css',
})
export class DoctorHomePageComponent implements OnInit {
  doctorName = '';
  doctorId: number | null = null;
  
  // Dashboard stats
  todayCount = 0;
  weekCount = 0;
  followUpsCount = 0;
  finishedCount = 0;

  // Active appointments list
  allAppointments: any[] = [];
  isLoadingSchedule = false;

  // Reschedule schedule modal
  showPopup = false;
  sessions: any[] = [];
  uniqueDays: any[] = [];
  selectedDate: string | null = null;
  selectedSessionId: number | null = null;
  appointmentId: number | null = null;

  constructor(
    private notificationService: NotificationService,
    private globalUserStateService: GlobalUserStateService,
    private doctorService: DoctorsService,
    private localStorageService: LocalstorageService,
    private router: Router,
    private toaster: ToastrService,
    public translateServiceService: TranslateServiceService
  ) {}

  ngOnInit() {
    const userId = this.globalUserStateService.userId();
    if (userId) {
      this.notificationService.startDoctorConnection(userId);
    }

    // Retrieve Doctor Info
    this.doctorName = this.localStorageService.get('doctorName') || 'Doctor';
    this.doctorId = Number(this.localStorageService.get('doctorId')) || null;

    if (this.doctorId) {
      this.loadDashboardStats();
      this.loadTodaysAppointments();
    }
  }

  loadDashboardStats() {
    if (!this.doctorId) return;
    this.doctorService.gethomeAppointments(this.doctorId).subscribe({
      next: (res) => {
        this.todayCount = res.toDayAppointmentsCount || 0;
        this.weekCount = res.weekAppointmentsCount || 0;
        this.followUpsCount = res.followUpsCount || 0;
        this.finishedCount = res.finishedAppointments || 0;
      },
      error: (err) => {
        console.error('Error loading home dashboard stats:', err);
      }
    });
  }

  loadTodaysAppointments() {
    if (!this.doctorId) return;
    this.isLoadingSchedule = true;
    this.doctorService.getAppointmentsToday(this.doctorId).subscribe({
      next: (res: any[]) => {
        this.allAppointments = res.map((session) => ({
          sessionId: session.sessionId,
          sessionStart: session.start,
          appointments: session.appointments || [],
        }));
        this.isLoadingSchedule = false;
      },
      error: (err) => {
        console.error('Error fetching today appointments:', err);
        this.isLoadingSchedule = false;
      },
    });
  }

  hasAppointments(): boolean {
    return this.allAppointments?.some(
      (session: any) => session.appointments?.length > 0
    );
  }

  confirmAppointment(appointmentId: number) {
    this.doctorService.confirmAppointment(appointmentId).subscribe({
      next: () => {
        this.toaster.success('Appointment confirmed successfully');
        this.loadDashboardStats();
        this.loadTodaysAppointments();
      },
      error: (err) => {
        console.error('Error confirming appointment:', err);
        this.toaster.error('Failed to confirm appointment');
      }
    });
  }

  cancelAppointment(appointmentId: number) {
    this.doctorService.cancelAppointment(appointmentId).subscribe({
      next: () => {
        this.toaster.success('Appointment canceled successfully');
        this.loadDashboardStats();
        this.loadTodaysAppointments();
      },
      error: (err) => {
        console.error('Error canceling appointment:', err);
        this.toaster.error('Failed to cancel appointment');
      }
    });
  }

  openMeeting(appointmentId: number) {
    this.doctorService.openAppointment(appointmentId).subscribe({
      next: (res: any) => {
        this.localStorageService.set('meetingId', res.id);
        this.localStorageService.set('channelName', res.channelName);
        this.localStorageService.set('checkUpId', res.checkUp.id);
        this.localStorageService.set('patientId', res.checkUp.patientId);
        this.localStorageService.set(
          'medicalHistory',
          JSON.stringify(res.patient.sections)
        );
        this.localStorageService.set('meetingToken', res.providerToken);
        this.localStorageService.set('agoraDetails', JSON.stringify(res));
        
        // Navigate to meeting/video call room
        this.router.navigate([`/doctor/videoCall/${res.id}`]);
      },
      error: (err) => {
        console.error('Error starting video meeting:', err);
        this.toaster.error('Failed to start meeting session');
      }
    });
  }

  handleAction(item: any) {
    switch (item.status) {
      case PatientAppointmentStatus.Created:
        this.confirmAppointment(item.id);
        break;
      case PatientAppointmentStatus.CreateComplaint:
      case PatientAppointmentStatus.Pending:
        this.openMeeting(item.id);
        break;
      case PatientAppointmentStatus.Started:
        const meeting = item.checkUp?.meetings?.[0];
        if (meeting) {
          this.localStorageService.set('meetingId', meeting.id);
          this.localStorageService.set('channelName', meeting.channelName);
          this.localStorageService.set('checkUpId', meeting.id);
          this.localStorageService.set('patientId', item.patient?.patientId);
          this.localStorageService.set(
            'medicalHistory',
            JSON.stringify(item.patient?.sections || [])
          );
          this.localStorageService.set('meetingToken', meeting.providerToken);
          this.localStorageService.set('agoraDetails', JSON.stringify(meeting));
          this.router.navigate([`/doctor/videoCall/${meeting.id}`]);
        } else {
          this.openMeeting(item.id);
        }
        break;
    }
  }

  // Reschedule Modal functions
  showModal(appointment: any) {
    this.appointmentId = appointment.id;
    this.showPopup = true;
    this.sessions = [];
    this.uniqueDays = [];
    if (!this.doctorId) return;
    this.doctorService.getSessions(this.doctorId).subscribe({
      next: (res: any[]) => {
        this.sessions = res;
        this.uniqueDays = Array.from(
          new Map(res.map((s) => [s.date, s])).values()
        );
        if (this.uniqueDays.length) {
          this.selectDay(this.uniqueDays[0].date);
        }
      },
      error: (err) => {
        console.error('Error fetching sessions:', err);
        this.sessions = [];
        this.uniqueDays = [];
      }
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
    if (!this.appointmentId || !this.selectedSessionId) return;

    this.doctorService
      .updateAppointment(this.appointmentId, this.selectedSessionId)
      .subscribe({
        next: () => {
          this.toaster.success('Appointment rescheduled successfully');
          this.loadTodaysAppointments();
          this.showPopup = false;
        },
        error: (err) => {
          const apiError = err?.error;
          if (apiError?.message) {
            this.toaster.error(apiError.message);
          } else if (apiError?.errors) {
            Object.entries(apiError.errors).forEach(
              ([key, messages]: [string, any]) => {
                messages.forEach((msg: string) => {
                  this.toaster.error(`${key} : ${msg}`);
                });
              }
            );
          } else {
            this.toaster.error('Failed to reschedule appointment');
          }
        },
      });
  }

  // Formatting & UI helpers
  formatTime(time: string): string {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
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

  getLocalDateString(): string {
    return new Date().toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getLocalDateStringEn(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}

