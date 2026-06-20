import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../../../shared/services/patient.service';

@Component({
  selector: 'app-doctor-policies-and-procedures',
  imports: [],
  templateUrl: './doctor-policies-and-procedures.component.html',
  styleUrl: './doctor-policies-and-procedures.component.css'
})
export class DoctorPoliciesAndProceduresComponent implements OnInit {
  data: any;

  constructor(readonly patientService: PatientService) {}

  ngOnInit() {
    this.loadTermsAndConditions();
  }

  loadTermsAndConditions() {
    const page = 'doctor-policies-and-procedures';
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
