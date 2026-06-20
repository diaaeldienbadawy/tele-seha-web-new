import { Component } from '@angular/core';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { FooterComponent } from '../../../../layouts/footer/footer.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-doctor-all-doctors-page',
  imports: [
    HeaderComponent,
    FooterComponent,
    RouterOutlet,
  ],
  templateUrl: './doctor-all-doctors-page.component.html',
  styleUrl: './doctor-all-doctors-page.component.css',
})
export class DoctorAllDoctorsPageComponent {}
