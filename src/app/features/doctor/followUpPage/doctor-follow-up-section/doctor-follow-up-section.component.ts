import { Component, OnInit } from '@angular/core';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { DoctorsService } from '../../../../shared/services/doctors.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PatientAppointmentStatus } from '../../../../core/enum/patientAppointmentStatus';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

type ReportItem = {
  type: 'LAB' | 'RADIOLOGY';
  links: string[];
};

@Component({
  selector: 'app-doctor-follow-up-section',
  imports: [CommonModule, TranslateModule],
  templateUrl: './doctor-follow-up-section.component.html',
  styleUrl: './doctor-follow-up-section.component.css',
})
export class DoctorFollowUpSectionComponent implements OnInit {
  showPopup: boolean = false;
  showPopupReports: boolean = false;

  sessions: any[] = [];
  uniqueDays: any[] = [];
  selectedDate: string | null = null;
  patientId: number | null = null;
  doctorId: number | null = null;
  constructor(
    readonly doctorService: DoctorsService,
    readonly localStorageService: LocalstorageService,
    readonly route: ActivatedRoute,
    readonly router: Router,
    readonly toaster: ToastrService,
  ) {}

  ngOnInit() {
    this.doctorId = Number(this.localStorageService.get('doctorId')) || null;
    this.loadTodaysAppointments();
  }

  data: any;
  allAppointments: any;
  loadTodaysAppointments() {
    this.doctorService
      .getFollowUpAppointments(Number(this.doctorId))
      .subscribe({
        next: (res: any) => {
          console.log(res);
          this.data = res;

          this.allAppointments = res.map((session: any) => ({
            sessionId: session.sessionId,
            date: session.date,
            sessionStart: session.start,
            appointments: session.appointments || [],
          }));

          console.log(this.allAppointments);
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

  labAnalysis: any;
  radiology: any;
  allLinks: string[] = [];

  reports: ReportItem[] = [];

  selectedImage: string | null = null;

  showReports(id: number) {
    console.log(id);
    this.doctorService.getReports(id).subscribe({
      next: (res) => {
        console.log('sssssssssssssssssssssssssssss');
        this.reports = [];

        // ===== LAB =====
        const lab = res.labAnalysisRequest?.result ?? [];

        if (lab.length) {
          this.reports.push({
            type: 'LAB',
            links: lab.flatMap((x: any) => x.links || []),
          });
        }

        // ===== RADIOLOGY =====
        const radiology =
          res.radiologicalExaminationRequest?.radiologicalExaminationResult ??
          [];

        if (radiology.length) {
          this.reports.push({
            type: 'RADIOLOGY',
            links: radiology.flatMap((x: any) => x.links || []),
          });
        }

        this.showPopupReports = true;
      },
      error: (err) => {
        const apiError = err?.error;

        if (apiError?.message) {
          this.toaster.error(apiError.message);
          return;
        }

        if (apiError?.errors) {
          Object.entries(apiError.errors).forEach(
            ([key, messages]: [string, any]) => {
              messages.forEach((msg: string) => {
                this.toaster.error(`${key} : ${msg}`);
              });
            },
          );
        }
      },
    });
  }

  isImage(link: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const ext = link.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(ext || '');
  }

  openFile(link: string) {
    window.open(link, '_blank');
  }

  getFileName(link: string): string {
    return link.split('/').pop() || 'File';
  }

  getFileExtension(link: string): string {
    return link.split('.').pop()?.toLowerCase() || '';
  }

  getFileIcon(ext: string): string {
    if (ext === 'pdf') return 'fa-file-pdf text-red-500';
    if (['doc', 'docx'].includes(ext)) return 'fa-file-word text-blue-500';
    if (['xls', 'xlsx'].includes(ext)) return 'fa-file-excel text-green-500';
    return 'fa-file text-gray-500';
  }

  downloadFile(link: string) {
    const a = document.createElement('a');

    a.href = link;
    a.target = '_blank'; // مهم
    a.rel = 'noopener';

    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  selectedSessionId: number | null = null;
  appointmentId: number | null = null;
  // openModal(appointment: any) {
  //   this.showPopup = true;
  //   this.appointmentId = appointment.id;
  //   this.showModal();
  // }

  confirmAppointment(appointmentId: number) {
    this.doctorService
      .confirmAppointment(appointmentId)
      .subscribe((res: any) => {
        // console.log(res);
        this.loadTodaysAppointments();
      });
  }

  cancelAppointment(appointmentId: number) {
    // console.log('Canceling appointment with ID:', appointmentId);

    this.doctorService
      .cancelAppointment(appointmentId)
      .subscribe((res: any) => {
        // console.log(res);
        this.loadTodaysAppointments();
      });
  }

  updateAppointment(appointmentId: number, newSessionId: number) {
    this.doctorService
      .updateAppointment(appointmentId, newSessionId)
      .subscribe((res: any) => {
        // console.log(res);
        this.loadTodaysAppointments();
      });
  }

  selectedMeetingId: number | null = null;
  openMeeting(appointmentId: number) {
    this.doctorService.openAppointment(appointmentId).subscribe((res: any) => {
      console.log(res);
      this.selectedMeetingId = res.id;
      this.loadTodaysAppointments();
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

  //

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

    this.doctorService
      .updateAppointment(this.appointmentId, this.selectedSessionId)
      .subscribe({
        next: (res: any) => {
          console.log(res);
          this.loadTodaysAppointments();
          this.showPopup = false;
        },
        error: (err) => {
          const apiError = err?.error;

          if (apiError?.message) {
            this.toaster.error(apiError.message);
            return;
          }

          if (apiError?.errors) {
            Object.entries(apiError.errors).forEach(
              ([key, messages]: [string, any]) => {
                messages.forEach((msg: string) => {
                  this.toaster.error(`${key} : ${msg}`);
                });
              },
            );
          }
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
    console.log(item);

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
        // this.joinMeeting(item);
        console.log(item);

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
