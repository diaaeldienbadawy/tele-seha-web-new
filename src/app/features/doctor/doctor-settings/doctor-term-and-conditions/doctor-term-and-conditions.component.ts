import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../../../shared/services/patient.service';

@Component({
  selector: 'app-doctor-term-and-conditions',
  imports: [],
  templateUrl: './doctor-term-and-conditions.component.html',
  styleUrl: './doctor-term-and-conditions.component.css'
})
export class DoctorTermAndConditionsComponent implements OnInit {
  data: any;

  constructor(readonly patientService: PatientService) {}

  ngOnInit() {
    this.loadTermsAndConditions();
  }

  loadTermsAndConditions() {
    const page = 'doctor-terms-and-conditions';
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
