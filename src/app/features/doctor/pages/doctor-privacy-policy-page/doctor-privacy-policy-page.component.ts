import { Component } from '@angular/core';
import { DoctorPrivacyPolicyComponent } from "../../doctor-settings/doctor-privacy-policy/doctor-privacy-policy.component";
import { HeaderComponent } from "../../../../layouts/header/header.component";

@Component({
  selector: 'app-doctor-privacy-policy-page',
  imports: [DoctorPrivacyPolicyComponent, HeaderComponent],
  templateUrl: './doctor-privacy-policy-page.component.html',
  styleUrl: './doctor-privacy-policy-page.component.css'
})
export class DoctorPrivacyPolicyPageComponent {

}
