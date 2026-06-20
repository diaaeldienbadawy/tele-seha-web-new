import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../../../shared/services/patient.service';

@Component({
  selector: 'app-patient-privacy-policy',
  imports: [],
  templateUrl: './patient-privacy-policy.component.html',
  styleUrl: './patient-privacy-policy.component.css',
})
export class PatientPrivacyPolicyComponent implements OnInit {
  data: any;

  constructor(readonly patientService: PatientService) {}

  ngOnInit() {
    this.loadTermsAndConditions();
  }

  loadTermsAndConditions() {
    const page = 'patient-privacy-policy';
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
