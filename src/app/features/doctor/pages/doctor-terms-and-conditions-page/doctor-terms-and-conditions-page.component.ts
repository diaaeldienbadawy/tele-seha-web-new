import { Component } from '@angular/core';
import { DoctorTermAndConditionsComponent } from "../../doctor-settings/doctor-term-and-conditions/doctor-term-and-conditions.component";
import { HeaderComponent } from "../../../../layouts/header/header.component";

@Component({
  selector: 'app-doctor-terms-and-conditions-page',
  imports: [DoctorTermAndConditionsComponent, HeaderComponent],
  templateUrl: './doctor-terms-and-conditions-page.component.html',
  styleUrl: './doctor-terms-and-conditions-page.component.css'
})
export class DoctorTermsAndConditionsPageComponent {

}
