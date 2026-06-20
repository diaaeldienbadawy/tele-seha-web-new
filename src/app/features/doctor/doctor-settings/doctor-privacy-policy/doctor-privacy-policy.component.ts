import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../../../shared/services/patient.service';

@Component({
  selector: 'app-doctor-privacy-policy',
  imports: [],
  templateUrl: './doctor-privacy-policy.component.html',
  styleUrl: './doctor-privacy-policy.component.css'
})
export class DoctorPrivacyPolicyComponent implements OnInit {
  data: any;

  constructor(readonly patientService: PatientService) {}

  ngOnInit() {
    this.loadTermsAndConditions();
  }

  loadTermsAndConditions() {
    const page = 'doctor-privacy-policy';
    this.patientService.getPrivacyAndTermsAndPolicy(page).subscribe({
      next: (res) => {
        console.log(res);

        this.data = res.data;
      },
      error: (err) => {
        this.data = '';
        console.log("ersssssssssssssssssssr");
        console.log(err);

      },
    });
  }

}
