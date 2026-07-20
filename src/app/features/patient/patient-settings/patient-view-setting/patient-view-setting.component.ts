import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PatientProfileComponent } from '../patient-profile/patient-profile.component';
import { PatientMedicalHistoryComponent } from '../patient-medical-history/patient-medical-history.component';
import { PatientCreateNewProfileComponent } from '../patient-create-new-profile/patient-create-new-profile.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-patient-view-setting',
  imports: [
    CommonModule,
    PatientProfileComponent,
    PatientMedicalHistoryComponent,
    PatientCreateNewProfileComponent,
    TranslateModule,
  ],
  templateUrl: './patient-view-setting.component.html',
  styleUrl: './patient-view-setting.component.css',
})
export class PatientViewSettingComponent {
  activeTab: 'profile' | 'createAccount' | 'medicalHistory' = 'profile';
}
