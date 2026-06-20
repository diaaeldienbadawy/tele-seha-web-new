import { Component } from '@angular/core';
import { AuthLeftSideComponent } from '../../../../shared/components/auth-left-side/auth-left-side.component';
import { AuthLogoComponent } from '../../../../shared/components/auth-logo/auth-logo.component';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doctor-register-step5',
  imports: [AuthLeftSideComponent, AuthLogoComponent, CommonModule, RouterLink],
  templateUrl: './doctor-register-step5.component.html',
  styleUrl: './doctor-register-step5.component.css',
})
export class DoctorRegisterStep5Component {
  showPopup: boolean = false;

  nationalIDName: string = '';
  degreeName: string = '';
  internshipName: string = '';
  syndicateName: string = '';
  licenseName: string = '';

  onNationalIDSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.nationalIDName = file.name;
  }

  onDegreeSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.degreeName = file.name;
  }

  onInternshipSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.internshipName = file.name;
  }

  onSyndicateSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.syndicateName = file.name;
  }

  onLicenseSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.licenseName = file.name;
  }
}
