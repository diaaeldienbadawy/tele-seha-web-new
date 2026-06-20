import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PatientProfileComponent } from '../patient-profile/patient-profile.component';
import { PatientMedicalHistoryComponent } from '../patient-medical-history/patient-medical-history.component';
import { PatientPoliciesAndProceduresComponent } from '../patient-policies-and-procedures/patient-policies-and-procedures.component';
import { PatientTermAndConditionsComponent } from '../patient-term-and-conditions/patient-term-and-conditions.component';
import { PatientPrivacyAndSecurityComponent } from '../patient-privacy-and-security/patient-privacy-and-security.component';
import { PatientSupportComponent } from '../patient-support/patient-support.component';
import { PatientPrivacyPolicyComponent } from '../patient-privacy-policy/patient-privacy-policy.component';
import { PatientCreateNewProfileComponent } from '../patient-create-new-profile/patient-create-new-profile.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-patient-view-setting',
  imports: [
    CommonModule,
    PatientProfileComponent,
    PatientMedicalHistoryComponent,
    PatientPoliciesAndProceduresComponent,
    PatientTermAndConditionsComponent,
    PatientPrivacyAndSecurityComponent,
    PatientSupportComponent,
    PatientPrivacyPolicyComponent,
    PatientCreateNewProfileComponent,
    TranslateModule,
  ],
  templateUrl: './patient-view-setting.component.html',
  styleUrl: './patient-view-setting.component.css',
})
export class PatientViewSettingComponent {
  activeTab:
    | 'privacyPolicy'
    | 'profile'
    | 'createAccount'
    | 'medicalHistory'
    | 'policies'
    | 'terms'
    | 'privacy'
    | 'support'
    | 'payment' = 'profile';
}
