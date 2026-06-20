import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '../../service/notification.service';
import { GlobalUserStateService } from '../../../../core/services/state/global-user-state.service';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { PatientReceptionSectionComponent } from "../../homePage/patient-reception-section/patient-reception-section.component";
import { PatientSpecialitesSectionComponent } from "../../homePage/patient-specialites-section/patient-specialites-section.component";
import { FooterComponent } from "../../../../layouts/footer/footer.component";
import { PatientRecentAppointmentsSectionComponent } from '../../homePage/patient-recent-appointments-section/patient-recent-appointments-section.component';
import { LocalstorageService } from '../../../../core/services/localstorage.service';

@Component({
  selector: 'app-patient-home-page',
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    HeaderComponent,
    PatientReceptionSectionComponent,
    PatientSpecialitesSectionComponent,
    FooterComponent,
    PatientRecentAppointmentsSectionComponent
  ],
  templateUrl: './patient-home-page.component.html',
  styleUrl: './patient-home-page.component.css'
})
export class PatientHomePageComponent implements OnInit {
  patientName = '';
  role = '';
  isBrowser = false;

  readonly platformId = inject(PLATFORM_ID);
  readonly localStorageService = inject(LocalstorageService);
  readonly notificationService = inject(NotificationService);
  readonly globalUserStateService = inject(GlobalUserStateService);

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      this.role = this.localStorageService.get('role') ?? '';
      if (this.role === 'Patient') {
        this.localStorageService.patientName$.subscribe((name) => {
          this.patientName = name;
        });
      }
    }

    const userId = this.globalUserStateService.userId();
    if (userId) {
      this.notificationService.startPatientConnection(userId);
    }
  }
}
