import { Component, OnDestroy } from '@angular/core';
import { DoctorMeetingVideoCallComponent } from '../doctor-meeting-video-call/doctor-meeting-video-call.component';
import { DoctorChatVideoCallComponent } from '../doctor-chat-video-call/doctor-chat-video-call.component';
import { CommonModule } from '@angular/common';
import { PopupDoctorComponent } from "../popup-doctor/popup-doctor.component";

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
export class DoctorViewVideoCallComponent implements OnDestroy {
  showWhatsapp = false;

  ngOnDestroy(): void {
    localStorage.removeItem('agoraDetails');
    localStorage.removeItem('meetingId');
    localStorage.removeItem('channelName');
    localStorage.removeItem('checkUpId');
    localStorage.removeItem('patientId');
    localStorage.removeItem('meetingToken');
  }
}
