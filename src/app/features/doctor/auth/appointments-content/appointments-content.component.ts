import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RecurringAppointmentsComponent } from "../recurring-appointments/recurring-appointments.component";
import { NonRecurringAppointmentsComponent } from "../non-recurring-appointments/non-recurring-appointments.component";
import { AuthLogoComponent } from '../../../../shared/components/auth-logo/auth-logo.component';

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalUserStateService } from '../../../../core/services/state/global-user-state.service';
import { DoctorRegistrationStateService } from '../../../../core/services/state/doctor-registration-state.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-appointments-content',
  imports: [
    CommonModule, 
    RecurringAppointmentsComponent, 
    NonRecurringAppointmentsComponent, 
    AuthLogoComponent,
    TranslateModule
  ],
  templateUrl: './appointments-content.component.html',
  styleUrl: './appointments-content.component.css'
})
export class AppointmentsContentComponent {
  private globalUserStateService = inject(GlobalUserStateService);
  private doctorRegistrationStateService = inject(DoctorRegistrationStateService);
  private route = inject(Router);

  activeTab: 'tab1' | 'tab2' = 'tab1';

  clearLocalStorage() {
    this.globalUserStateService.clearUserData();
    this.doctorRegistrationStateService.clearRegistrationData();
    this.route.navigate(['/'], { replaceUrl: true });
  }
}
