import { Component } from '@angular/core';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { FooterComponent } from '../../../../layouts/footer/footer.component';
import { DoctorWeeksAppointmentsHeroSectionComponent } from '../../weekAppointmentsPage/doctor-weeks-appointments-hero-section/doctor-weeks-appointments-hero-section.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-doctor-weeks-appointments-page',
  imports: [
    HeaderComponent,
    FooterComponent,
    DoctorWeeksAppointmentsHeroSectionComponent,
    RouterOutlet,
  ],
  templateUrl: './doctor-weeks-appointments-page.component.html',
  styleUrl: './doctor-weeks-appointments-page.component.css',
})
export class DoctorWeeksAppointmentsPageComponent {}
