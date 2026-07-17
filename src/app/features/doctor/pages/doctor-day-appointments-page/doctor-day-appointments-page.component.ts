import { Component } from '@angular/core';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { FooterComponent } from "../../../../layouts/footer/footer.component";
import { DoctorDayAppointmentsComponent } from "../../day/doctor-day-appointments/doctor-day-appointments.component";

@Component({
  selector: 'app-doctor-day-appointments-page',
  imports: [HeaderComponent, DoctorDayAppointmentsComponent, FooterComponent],
  templateUrl: './doctor-day-appointments-page.component.html',
  styleUrl: './doctor-day-appointments-page.component.css'
})
export class DoctorDayAppointmentsPageComponent {

}
