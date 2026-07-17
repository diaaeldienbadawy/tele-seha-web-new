import { Component } from '@angular/core';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { FooterComponent } from "../../../../layouts/footer/footer.component";
import { DoctorViewSettingComponent } from "../../doctor-settings/doctor-view-setting/doctor-view-setting.component";

@Component({
  selector: 'app-doctor-settings',
  imports: [HeaderComponent, FooterComponent, DoctorViewSettingComponent],
  templateUrl: './doctor-settings.component.html',
  styleUrl: './doctor-settings.component.css'
})
export class DoctorSettingsComponent {

}
