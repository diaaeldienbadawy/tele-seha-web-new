import { Component } from '@angular/core';
import { PatientReportHeroSectionComponent } from "../patient-report-hero-section/patient-report-hero-section.component";
import { CommonModule } from '@angular/common';
import { PatientReportPrescriptionsSectionComponent } from "../patient-report-prescriptions-section/patient-report-prescriptions-section.component";
import { PatientReportRadiologySectionComponent } from "../patient-report-radiology-section/patient-report-radiology-section.component";
import { PatientReportLabTestsSectionComponent } from "../patient-report-lab-tests-section/patient-report-lab-tests-section.component";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-patient-report-content-section',
  imports: [
    CommonModule, 
    PatientReportHeroSectionComponent, 
    PatientReportPrescriptionsSectionComponent, 
    PatientReportRadiologySectionComponent, 
    PatientReportLabTestsSectionComponent,
    TranslateModule
  ],
  templateUrl: './patient-report-content-section.component.html',
  styleUrl: './patient-report-content-section.component.css'
})
export class PatientReportContentSectionComponent {

  activeTab: 'tab1' | 'tab2' | 'tab3' = 'tab1';


}
