import { Component } from '@angular/core';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { FooterComponent } from "../../../../layouts/footer/footer.component";
import { RouterOutlet } from '@angular/router';
import { DoctorMyAppointmentsHeroSectionComponent } from "../../doctorMyAppointmentsPage/doctor-my-appointments-hero-section/doctor-my-appointments-hero-section.component";

@Component({
  selector: 'app-doctor-my-appointments-page',
  imports: [HeaderComponent, RouterOutlet, FooterComponent, DoctorMyAppointmentsHeroSectionComponent],
  templateUrl: './doctor-my-appointments-page.component.html',
  styleUrl: './doctor-my-appointments-page.component.css'
})
export class DoctorMyAppointmentsPageComponent {

}
