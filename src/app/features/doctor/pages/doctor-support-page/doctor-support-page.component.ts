import { Component } from '@angular/core';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { DoctorSupportComponent } from "../../doctor-settings/doctor-support/doctor-support.component";

@Component({
  selector: 'app-doctor-support-page',
  imports: [HeaderComponent, DoctorSupportComponent],
  templateUrl: './doctor-support-page.component.html',
  styleUrl: './doctor-support-page.component.css'
})
export class DoctorSupportPageComponent {

}
