import { Component } from '@angular/core';
import { FooterComponent } from '../../../../layouts/footer/footer.component';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { DoctorFollowUpSectionComponent } from "../../followUpPage/doctor-follow-up-section/doctor-follow-up-section.component";

@Component({
  selector: 'app-doctor-follow-up-page',
  imports: [
    FooterComponent,
    HeaderComponent,
    DoctorFollowUpSectionComponent
],
  templateUrl: './doctor-follow-up-page.component.html',
  styleUrl: './doctor-follow-up-page.component.css',
})
export class DoctorFollowUpPageComponent {}
