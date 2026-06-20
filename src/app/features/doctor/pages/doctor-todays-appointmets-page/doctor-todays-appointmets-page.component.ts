import { Component } from '@angular/core';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { FooterComponent } from "../../../../layouts/footer/footer.component";
import { DoctorTodayHeroSectionComponent } from "../../todayAppointmentsPage/doctor-today-hero-section/doctor-today-hero-section.component";
import { DoctorTodaysAppointmentsSectionComponent } from "../../todayAppointmentsPage/doctor-todays-appointments-section/doctor-todays-appointments-section.component";

@Component({
  selector: 'app-doctor-todays-appointmets-page',
  imports: [HeaderComponent, FooterComponent, DoctorTodayHeroSectionComponent, DoctorTodaysAppointmentsSectionComponent],
  templateUrl: './doctor-todays-appointmets-page.component.html',
  styleUrl: './doctor-todays-appointmets-page.component.css'
})
export class DoctorTodaysAppointmetsPageComponent {

}
