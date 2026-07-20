import { Component } from '@angular/core';
import { PatientSupportComponent } from '../../patient-settings/patient-support/patient-support.component';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { FooterComponent } from '../../../../layouts/footer/footer.component';

@Component({
  selector: 'app-patient-support-page',
  imports: [PatientSupportComponent, HeaderComponent, FooterComponent],
  templateUrl: './patient-support-page.component.html',
  styleUrl: './patient-support-page.component.css'
})
export class PatientSupportPageComponent {}
