import { Component } from '@angular/core';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { DoctorViewVideoCallComponent } from "../../doctorVideoCallPage/doctor-view-video-call/doctor-view-video-call.component";

@Component({
  selector: 'app-doctor-video-call-page',
  imports: [HeaderComponent, DoctorViewVideoCallComponent],
  templateUrl: './doctor-video-call-page.component.html',
  styleUrl: './doctor-video-call-page.component.css'
})
export class DoctorVideoCallPageComponent {

}
