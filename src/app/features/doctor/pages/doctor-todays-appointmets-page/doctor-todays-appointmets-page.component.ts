import { Component } from '@angular/core';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { FooterComponent } from "../../../../layouts/footer/footer.component";
import { DoctorTodaysAppointmentsSectionComponent } from "../../todayAppointmentsPage/doctor-todays-appointments-section/doctor-todays-appointments-section.component";

@Component({
  selector: 'app-doctor-todays-appointmets-page',
  imports: [HeaderComponent, FooterComponent, DoctorTodaysAppointmentsSectionComponent],
  templateUrl: './doctor-todays-appointmets-page.component.html',
  styleUrl: './doctor-todays-appointmets-page.component.css'
})
export class DoctorTodaysAppointmetsPageComponent {

}
