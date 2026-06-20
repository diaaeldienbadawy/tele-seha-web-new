import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-patient-payment-records',
  imports: [CommonModule],
  templateUrl: './patient-payment-records.component.html',
  styleUrl: './patient-payment-records.component.css'
})
export class PatientPaymentRecordsComponent {

  activeTab : 'tab1' | 'tab2' = 'tab1' ;

}
