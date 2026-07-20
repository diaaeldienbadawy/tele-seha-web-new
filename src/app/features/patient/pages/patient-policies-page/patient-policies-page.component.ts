import { Component } from '@angular/core';
import { PatientPoliciesAndProceduresComponent } from '../../patient-settings/patient-policies-and-procedures/patient-policies-and-procedures.component';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { FooterComponent } from '../../../../layouts/footer/footer.component';

@Component({
  selector: 'app-patient-policies-page',
  imports: [PatientPoliciesAndProceduresComponent, HeaderComponent, FooterComponent],
  templateUrl: './patient-policies-page.component.html',
  styleUrl: './patient-policies-page.component.css'
})
export class PatientPoliciesPageComponent {}
