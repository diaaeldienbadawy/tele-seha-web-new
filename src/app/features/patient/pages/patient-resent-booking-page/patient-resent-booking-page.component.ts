import { Component } from '@angular/core';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { FooterComponent } from "../../../../layouts/footer/footer.component";
import { PatientAllResentSectionComponent } from "../../resentBookingPage/patient-all-resent-section/patient-all-resent-section.component";

@Component({
  selector: 'app-patient-resent-booking-page',
  imports: [HeaderComponent, FooterComponent, PatientAllResentSectionComponent],
  templateUrl: './patient-resent-booking-page.component.html',
  styleUrl: './patient-resent-booking-page.component.css'
})
export class PatientResentBookingPageComponent {

}
