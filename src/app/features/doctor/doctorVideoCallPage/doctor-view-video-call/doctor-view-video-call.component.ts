import { Component, OnDestroy, OnInit } from '@angular/core';
import { DoctorMeetingVideoCallComponent } from '../doctor-meeting-video-call/doctor-meeting-video-call.component';
import { DoctorChatVideoCallComponent } from '../doctor-chat-video-call/doctor-chat-video-call.component';
import { CommonModule } from '@angular/common';
import { PopupDoctorComponent } from "../popup-doctor/popup-doctor.component";
import { Router, ActivatedRoute } from '@angular/router';
import { DoctorsService } from '../../../../shared/services/doctors.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-doctor-view-video-call',
  imports: [
    CommonModule,
    DoctorMeetingVideoCallComponent,
    DoctorChatVideoCallComponent,
    PopupDoctorComponent
],
  templateUrl: './doctor-view-video-call.component.html',
  styleUrl: './doctor-view-video-call.component.css',
})
export class DoctorViewVideoCallComponent implements OnInit, OnDestroy {
  showWhatsapp = false;
  meetingId!: number;
  isValidating = true;
  isMeetingValid = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorsService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.meetingId = Number(params['meetingId']);
      if (this.meetingId) {
        this.checkMeetingStatus();
      } else {
        this.router.navigate(['/doctor/home']);
      }
    });
  }

  checkMeetingStatus() {
    this.doctorService.getReports(this.meetingId).subscribe({
      next: (res) => {
        // الاجتماع بيتقفل من الباك اند أو بقرار الطبيب فقط — مش من ساعة المتصفح.
        // قفل الكشف انتقال لا رجعة فيه، ومينفعش يتقاد من الوقت المنقضي في المتصفح:
        // العيادات بتتأخر، وطبيب قعد أطول من مدة الـ slot لازم يكمّل مكالمته من غير
        // ما الصفحة تقفل الميتينج (وبالتبعية الكشف) من ورا ظهره عند أي refresh.
        // فبنعتمد على حالة الاجتماع من السيرفر بس: Completed(2) أو Canceled(3).
        if (res?.status === 2 || res?.status === 3) {
          const message = res?.status === 3
            ? 'هذه الجلسة تم إلغاؤها'
            : 'هذه الجلسة انتهت بالفعل';
          this.toastr.warning(message);
          this.router.navigate(['/doctor/home']);
          return;
        }

        this.isMeetingValid = true;
        this.isValidating = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('فشل تحميل بيانات الجلسة');
        this.router.navigate(['/doctor/home']);
      }
    });
  }

  ngOnDestroy(): void {
    localStorage.removeItem('agoraDetails');
    localStorage.removeItem('meetingId');
    localStorage.removeItem('channelName');
    localStorage.removeItem('checkUpId');
    localStorage.removeItem('patientId');
    localStorage.removeItem('meetingToken');
  }
}
