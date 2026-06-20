import { Component } from '@angular/core';
import { DoctorsService } from '../../../../shared/services/doctors.service';
import { IDoctorResponse } from '../../../../shared/interface/doctor.interface';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-search-for-doctor-all-doctor',
  imports: [RouterLink],
  templateUrl: './search-for-doctor-all-doctor.component.html',
  styleUrl: './search-for-doctor-all-doctor.component.css',
})
export class SearchForDoctorAllDoctorComponent {
  constructor(readonly doctorsService: DoctorsService) {}

  doctors: IDoctorResponse[] = [];

  ngOnInit(): void {
    this.listenToDoctors();
  }

  listenToDoctors() {
    this.doctorsService.getDoctors().subscribe({
      next: (res: any) => {
        this.doctors = res.data || res;
        console.log('Doctors:', this.doctors);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
