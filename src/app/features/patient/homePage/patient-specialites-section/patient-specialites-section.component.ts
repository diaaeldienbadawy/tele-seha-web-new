import { Component, OnInit } from '@angular/core';
import { SpecialtiesService } from '../../../../shared/services/specialties.service';
import { ISpecialties } from '../../../../shared/interface/specialties.interface';
import { CommonModule } from '@angular/common';
import { RouterLink , Router } from '@angular/router';
import { LocalstorageService } from '../../../../core/services/localstorage.service';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-patient-specialites-section',
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './patient-specialites-section.component.html',
  styleUrl: './patient-specialites-section.component.css',
})
export class PatientSpecialitesSectionComponent implements OnInit {
  constructor(
    readonly specialtiesService: SpecialtiesService,
    readonly route: Router,
    readonly localStorageService: LocalstorageService
  ) {}

  specialties: ISpecialties[] = [];
  ngOnInit(): void {
    this.loadSpecialties();
  }

  loadSpecialties() {
    this.specialtiesService.getSpecialties().subscribe((res: any) => {
      console.log(res);

      const data = res.data || res;
      this.specialties = Array.isArray(data) ? data.slice(0, 6) : [];
    });
  }

  bookNow(item: number) {
    console.log(item);

    this.localStorageService.set('specialtyId', JSON.stringify(item));

    this.route.navigate(['/patient/allDoctors']);
  }
}
