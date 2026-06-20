import { Component } from '@angular/core';
import { PatientSymptomsSectionComponent } from './patient-symptoms-section/patient-symptoms-section.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-patient-reception-section',
  imports: [CommonModule, PatientSymptomsSectionComponent, TranslateModule],
  templateUrl: './patient-reception-section.component.html',
  styleUrl: './patient-reception-section.component.css',
})
export class PatientReceptionSectionComponent {
  showPopup = false;

  openModel() {
    this.showPopup = true;
  }

  closeModel() {
    this.showPopup = false;
  }
}
