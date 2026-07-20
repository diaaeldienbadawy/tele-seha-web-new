import { Component } from '@angular/core';
import { PatientPrivacyAndSecurityComponent } from '../../patient-settings/patient-privacy-and-security/patient-privacy-and-security.component';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { FooterComponent } from '../../../../layouts/footer/footer.component';

@Component({
  selector: 'app-patient-privacy-security-page',
  imports: [PatientPrivacyAndSecurityComponent, HeaderComponent, FooterComponent],
  templateUrl: './patient-privacy-security-page.component.html',
  styleUrl: './patient-privacy-security-page.component.css'
})
export class PatientPrivacySecurityPageComponent {}
