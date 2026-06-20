import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RecurringAppointmentsComponent } from "../recurring-appointments/recurring-appointments.component";
import { NonRecurringAppointmentsComponent } from "../non-recurring-appointments/non-recurring-appointments.component";
import { AuthLogoComponent } from '../../../../shared/components/auth-logo/auth-logo.component';

@Component({
  selector: 'app-appointments-content',
  imports: [CommonModule, RecurringAppointmentsComponent, NonRecurringAppointmentsComponent, AuthLogoComponent],
  templateUrl: './appointments-content.component.html',
  styleUrl: './appointments-content.component.css'
})
export class AppointmentsContentComponent {

  activeTab: 'tab1' | 'tab2' = 'tab1';

}
