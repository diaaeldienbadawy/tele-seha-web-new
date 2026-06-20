import { Component } from '@angular/core';
import { AuthLeftSideComponent } from "../../../../shared/components/auth-left-side/auth-left-side.component";
import { AuthLogoComponent } from "../../../../shared/components/auth-logo/auth-logo.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-doctor-register-step4',
  imports: [AuthLeftSideComponent, AuthLogoComponent,RouterLink],
  templateUrl: './doctor-register-step4.component.html',
  styleUrl: './doctor-register-step4.component.css'
})
export class DoctorRegisterStep4Component {

}
