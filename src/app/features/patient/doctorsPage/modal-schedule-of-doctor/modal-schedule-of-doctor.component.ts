import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-modal-schedule-of-doctor',
  imports: [],
  templateUrl: './modal-schedule-of-doctor.component.html',
  styleUrl: './modal-schedule-of-doctor.component.css',
})
export class ModalScheduleOfDoctorComponent implements OnInit {
  @Input() doctorId: string | null = null;

  constructor() {
    console.log(this.doctorId);
  }

  ngOnInit(): void {
    console.log(this.doctorId);
  }
}
