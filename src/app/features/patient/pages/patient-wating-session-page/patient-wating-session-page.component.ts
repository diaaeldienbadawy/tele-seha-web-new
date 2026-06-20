import { Component } from '@angular/core';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { FooterComponent } from "../../../../layouts/footer/footer.component";
import { PatientWaitingInfoSectionComponent } from '../../watingSessionPage/patient-waiting-info-section/patient-waiting-info-section.component';

@Component({
  selector: 'app-patient-wating-session-page',
  imports: [HeaderComponent, PatientWaitingInfoSectionComponent, FooterComponent],
  templateUrl: './patient-wating-session-page.component.html',
  styleUrl: './patient-wating-session-page.component.css'
})
export class PatientWatingSessionPageComponent {

}
