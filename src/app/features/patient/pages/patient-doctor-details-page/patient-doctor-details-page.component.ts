import { Component } from '@angular/core';
import { DoctorDetailsSectionComponent } from "../../doctorsDetailsPage/doctor-details-section/doctor-details-section.component";
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { FooterComponent } from "../../../../layouts/footer/footer.component";

@Component({
  selector: 'app-patient-doctor-details-page',
  imports: [DoctorDetailsSectionComponent, HeaderComponent, FooterComponent],
  templateUrl: './patient-doctor-details-page.component.html',
  styleUrl: './patient-doctor-details-page.component.css'
})
export class PatientDoctorDetailsPageComponent {

}
