import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../../../shared/services/patient.service';

@Component({
  selector: 'app-patient-policies-and-procedures',
  imports: [],
  templateUrl: './patient-policies-and-procedures.component.html',
  styleUrl: './patient-policies-and-procedures.component.css',
})
export class PatientPoliciesAndProceduresComponent implements OnInit {
  data: any;

  constructor(readonly patientService: PatientService) {}

  ngOnInit() {
    this.loadTermsAndConditions();
  }

  loadTermsAndConditions() {
    const page = 'patient-terms-and-conditions';
    this.patientService.getPrivacyAndTermsAndPolicy(page).subscribe({
      next: (res) => {
        console.log(res);

        this.data = res.data;
      },
      error: () => {
        this.data = '';
      },
    });
  }
}
