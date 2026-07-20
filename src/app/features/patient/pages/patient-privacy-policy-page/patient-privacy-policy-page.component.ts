import { Component } from '@angular/core';
import { PatientPrivacyPolicyComponent } from '../../patient-settings/patient-privacy-policy/patient-privacy-policy.component';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { FooterComponent } from '../../../../layouts/footer/footer.component';

@Component({
  selector: 'app-patient-privacy-policy-page',
  imports: [PatientPrivacyPolicyComponent, HeaderComponent, FooterComponent],
  templateUrl: './patient-privacy-policy-page.component.html',
  styleUrl: './patient-privacy-policy-page.component.css'
})
export class PatientPrivacyPolicyPageComponent {}
