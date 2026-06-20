import { Component } from '@angular/core';
import { AuthLeftSideComponent } from '../../../../shared/components/auth-left-side/auth-left-side.component';
import { AuthLogoComponent } from '../../../../shared/components/auth-logo/auth-logo.component';
import { Router, RouterLink } from '@angular/router';
import { GlobalUserStateService } from '../../../../core/services/state/global-user-state.service';
import { DoctorRegistrationStateService } from '../../../../core/services/state/doctor-registration-state.service';

@Component({
  selector: 'app-wating-for-acctivation',
  imports: [AuthLeftSideComponent, AuthLogoComponent, RouterLink],
  templateUrl: './wating-for-acctivation.component.html',
  styleUrl: './wating-for-acctivation.component.css',
  providers: [DoctorRegistrationStateService]
})
export class WatingForAcctivationComponent {
  constructor(
    readonly globalUserStateService: GlobalUserStateService,
    readonly doctorRegistrationStateService: DoctorRegistrationStateService,
    readonly route: Router,
  ) {}

  clearLocalStorage() {
    this.globalUserStateService.clearUserData();
    this.doctorRegistrationStateService.clearRegistrationData();
    this.route.navigate(['/'], { replaceUrl: true });
  }
}
