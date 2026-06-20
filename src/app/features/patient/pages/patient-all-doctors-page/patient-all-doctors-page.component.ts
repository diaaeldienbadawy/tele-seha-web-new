import { Component } from '@angular/core';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { PatientAllDoctorsSectionComponent } from "../../doctorsPage/patient-all-doctors-section/patient-all-doctors-section.component";
import { FooterComponent } from "../../../../layouts/footer/footer.component";

@Component({
  selector: 'app-patient-all-doctors-page',
  imports: [HeaderComponent, PatientAllDoctorsSectionComponent, FooterComponent],
  templateUrl: './patient-all-doctors-page.component.html',
  styleUrl: './patient-all-doctors-page.component.css'
})
export class PatientAllDoctorsPageComponent {

}
