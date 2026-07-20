import { Component } from '@angular/core';
import { PatientTermAndConditionsComponent } from '../../patient-settings/patient-term-and-conditions/patient-term-and-conditions.component';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { FooterComponent } from '../../../../layouts/footer/footer.component';

@Component({
  selector: 'app-patient-terms-page',
  imports: [PatientTermAndConditionsComponent, HeaderComponent, FooterComponent],
  templateUrl: './patient-terms-page.component.html',
  styleUrl: './patient-terms-page.component.css'
})
export class PatientTermsPageComponent {}
