import { GlobalUserStateService } from '../../../../core/services/state/global-user-state.service';
import { Component } from '@angular/core';
import { AuthLogoComponent } from '../../../../shared/components/auth-logo/auth-logo.component';
import { AuthLeftSideComponent } from '../../../../shared/components/auth-left-side/auth-left-side.component';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-select-profile',
  imports: [AuthLogoComponent, AuthLeftSideComponent, RouterLink, TranslateModule],
  templateUrl: './select-profile.component.html',
  styleUrl: './select-profile.component.css',
})
export class SelectProfileComponent {
  patients: any[] = [];
  constructor(
    readonly globalUserStateService: GlobalUserStateService,
    readonly route: Router,
  ) {}

  ngOnInit() {
    this.patients = this.globalUserStateService.patients();
  }

  selectProfile(patient: any) {
    this.globalUserStateService.selectPatientProfile(patient.patientId, patient.name);

    this.route.navigate(['patient/home'], { replaceUrl: true });
  }

  clearLocalStorage() {
    this.globalUserStateService.clearUserData();
    this.route.navigate(['/'], { replaceUrl: true });
  }
}
