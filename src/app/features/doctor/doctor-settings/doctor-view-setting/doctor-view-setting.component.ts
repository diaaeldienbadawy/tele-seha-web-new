import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DoctorPrivacyAndSecurityComponent } from '../doctor-privacy-and-security/doctor-privacy-and-security.component';
import { DoctorProfileComponent } from '../doctor-profile/doctor-profile.component';
import { DoctorPoliciesAndProceduresComponent } from '../doctor-policies-and-procedures/doctor-policies-and-procedures.component';
import { DoctorTermAndConditionsComponent } from '../doctor-term-and-conditions/doctor-term-and-conditions.component';
import { DoctorSupportComponent } from '../doctor-support/doctor-support.component';
import { DoctorPrivacyPolicyComponent } from '../doctor-privacy-policy/doctor-privacy-policy.component';
import { AssistantSettingComponent } from '../assistant-setting/assistant-setting.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-doctor-view-setting',
  imports: [
    CommonModule,
    DoctorPrivacyAndSecurityComponent,
    DoctorProfileComponent,
    DoctorPoliciesAndProceduresComponent,
    DoctorTermAndConditionsComponent,
    DoctorSupportComponent,
    DoctorPrivacyPolicyComponent,
    AssistantSettingComponent,
    TranslateModule,
  ],
  templateUrl: './doctor-view-setting.component.html',
  styleUrl: './doctor-view-setting.component.css',
})
export class DoctorViewSettingComponent {
  activeTab:
    | 'profile'
    | 'policies'
    | 'terms'
    | 'privacy'
    | 'privacyPolicy'
    | 'support'
    | 'Assistant' = 'profile';
}
