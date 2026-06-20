import { Component } from '@angular/core';
import { PatientViewSettingComponent } from "../../patient-settings/patient-view-setting/patient-view-setting.component";
import { HeaderComponent } from "../../../../layouts/header/header.component";

@Component({
  selector: 'app-patient-settings',
  imports: [PatientViewSettingComponent, HeaderComponent],
  templateUrl: './patient-settings.component.html',
  styleUrl: './patient-settings.component.css'
})
export class PatientSettingsComponent {

}
