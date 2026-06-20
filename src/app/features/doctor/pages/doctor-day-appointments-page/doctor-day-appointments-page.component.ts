import { Component } from '@angular/core';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { DoctorDayAppointmentsComponent } from "../../day/doctor-day-appointments/doctor-day-appointments.component";
import { DoctorDayHeroSectionComponent } from "../../day/doctor-day-hero-section/doctor-day-hero-section.component";

@Component({
  selector: 'app-doctor-day-appointments-page',
  imports: [HeaderComponent, DoctorDayAppointmentsComponent, DoctorDayHeroSectionComponent],
  templateUrl: './doctor-day-appointments-page.component.html',
  styleUrl: './doctor-day-appointments-page.component.css'
})
export class DoctorDayAppointmentsPageComponent {

}
