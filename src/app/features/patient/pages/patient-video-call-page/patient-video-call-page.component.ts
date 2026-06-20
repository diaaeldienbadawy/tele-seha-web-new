import { Component } from '@angular/core';
import { PatientViewVideoCallComponent } from "../../videoCall/patient-view-video-call/patient-view-video-call.component";
import { HeaderComponent } from "../../../../layouts/header/header.component";

@Component({
  selector: 'app-patient-video-call-page',
  imports: [PatientViewVideoCallComponent, HeaderComponent],
  templateUrl: './patient-video-call-page.component.html',
  styleUrl: './patient-video-call-page.component.css'
})
export class PatientVideoCallPageComponent {

}
