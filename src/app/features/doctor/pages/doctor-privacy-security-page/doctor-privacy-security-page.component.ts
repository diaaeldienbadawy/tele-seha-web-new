import { Component } from '@angular/core';
import { DoctorPrivacyAndSecurityComponent } from '../../doctor-settings/doctor-privacy-and-security/doctor-privacy-and-security.component';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { FooterComponent } from '../../../../layouts/footer/footer.component';

@Component({
  selector: 'app-doctor-privacy-security-page',
  imports: [DoctorPrivacyAndSecurityComponent, HeaderComponent, FooterComponent],
  templateUrl: './doctor-privacy-security-page.component.html',
  styleUrl: './doctor-privacy-security-page.component.css'
})
export class DoctorPrivacySecurityPageComponent {}
