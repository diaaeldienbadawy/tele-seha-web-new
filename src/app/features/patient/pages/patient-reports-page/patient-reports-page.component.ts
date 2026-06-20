import { Component } from '@angular/core';
import { PatientReportContentSectionComponent } from "../../ReportsPage/patient-report-content-section/patient-report-content-section.component";
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { FooterComponent } from "../../../../layouts/footer/footer.component";

@Component({
  selector: 'app-patient-reports-page',
  imports: [PatientReportContentSectionComponent, HeaderComponent, FooterComponent],
  templateUrl: './patient-reports-page.component.html',
  styleUrl: './patient-reports-page.component.css'
})
export class PatientReportsPageComponent {

}
