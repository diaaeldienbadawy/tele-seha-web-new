import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../../../shared/services/patient.service';

@Component({
  selector: 'app-patient-term-and-conditions',
  imports: [],
  templateUrl: './patient-term-and-conditions.component.html',
  styleUrl: './patient-term-and-conditions.component.css',
})
export class PatientTermAndConditionsComponent implements OnInit {
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
