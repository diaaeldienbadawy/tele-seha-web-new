import { Component } from '@angular/core';
import { DoctorPoliciesAndProceduresComponent } from '../../doctor-settings/doctor-policies-and-procedures/doctor-policies-and-procedures.component';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { FooterComponent } from '../../../../layouts/footer/footer.component';

@Component({
  selector: 'app-doctor-policies-page',
  imports: [DoctorPoliciesAndProceduresComponent, HeaderComponent, FooterComponent],
  templateUrl: './doctor-policies-page.component.html',
  styleUrl: './doctor-policies-page.component.css'
})
export class DoctorPoliciesPageComponent {}
