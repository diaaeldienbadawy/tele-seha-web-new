import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RecurringAppointmentsComponent } from "../../auth/recurring-appointments/recurring-appointments.component";
import { NonRecurringAppointmentsComponent } from "../../auth/non-recurring-appointments/non-recurring-appointments.component";
import { DoctorInfoComponent } from "./doctor-info/doctor-info.component";
import { SpecialtyInfoComponent } from './specialty-info/specialty-info.component';
import { DoctorNonRecurringAppointmentsComponent } from "./doctor-non-recurring-appointments/doctor-non-recurring-appointments.component";
import { DoctorRecurringAppointmentsComponent } from "./doctor-recurring-appointments/doctor-recurring-appointments.component";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-doctor-profile',
  imports: [
    FormsModule,
    CommonModule,
    RecurringAppointmentsComponent,
    NonRecurringAppointmentsComponent,
    DoctorInfoComponent,
    SpecialtyInfoComponent,
    DoctorNonRecurringAppointmentsComponent,
    DoctorRecurringAppointmentsComponent,
    TranslateModule
],
  templateUrl: './doctor-profile.component.html',
  styleUrl: './doctor-profile.component.css',
})
export class DoctorProfileComponent {
  checked: boolean = false;

  activeTab: 'tab1' | 'tab2' | 'tab3' | 'tab4' = 'tab1';
}
