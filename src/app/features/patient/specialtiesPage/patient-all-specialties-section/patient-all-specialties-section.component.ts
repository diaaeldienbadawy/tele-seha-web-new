import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ISpecialties } from '../../../../shared/interface/specialties.interface';
import { SpecialtiesService } from '../../../../shared/services/specialties.service';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { Router } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-patient-all-specialties-section',
  imports: [CommonModule, TranslateModule],
  templateUrl: './patient-all-specialties-section.component.html',
  styleUrl: './patient-all-specialties-section.component.css',
})
export class PatientAllSpecialtiesSectionComponent implements OnInit {
  constructor(
    readonly specialtiesService: SpecialtiesService,
    readonly localStorageService: LocalstorageService,
    readonly route : Router
  ) {}

  specialties: ISpecialties[] = [];
  ngOnInit(): void {
    this.loadSpecialties();
  }

  loadSpecialties() {
    this.specialtiesService.getSpecialties().subscribe((res: any) => {
      console.log(res);

      this.specialties = res.data || res;
    });
  }

  bookNow(item: number) {
    console.log(item);

    this.localStorageService.set('specialtyId', JSON.stringify(item));

    this.route.navigate(['/patient/allDoctors']);

  }
}
