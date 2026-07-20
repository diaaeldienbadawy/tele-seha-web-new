import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DoctorProfileComponent } from '../doctor-profile/doctor-profile.component';
import { AssistantSettingComponent } from '../assistant-setting/assistant-setting.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-doctor-view-setting',
  imports: [
    CommonModule,
    DoctorProfileComponent,
    AssistantSettingComponent,
    TranslateModule,
  ],
  templateUrl: './doctor-view-setting.component.html',
  styleUrl: './doctor-view-setting.component.css',
})
export class DoctorViewSettingComponent {
  activeTab: 'profile' | 'Assistant' = 'profile';
}
