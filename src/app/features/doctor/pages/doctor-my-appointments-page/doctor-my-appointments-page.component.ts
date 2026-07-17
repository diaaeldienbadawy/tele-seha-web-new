import { Component } from '@angular/core';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { FooterComponent } from "../../../../layouts/footer/footer.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-doctor-my-appointments-page',
  imports: [HeaderComponent, RouterOutlet, FooterComponent],
  templateUrl: './doctor-my-appointments-page.component.html',
  styleUrl: './doctor-my-appointments-page.component.css'
})
export class DoctorMyAppointmentsPageComponent {

}
