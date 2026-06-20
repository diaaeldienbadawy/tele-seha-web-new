import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { ISpecialties } from '../../../../shared/interface/specialties.interface';
import { SpecialtiesService } from '../../../../shared/services/specialties.service';

@Component({
  selector: 'app-all-specailties',
  imports: [],
  templateUrl: './all-specailties.component.html',
  styleUrl: './all-specailties.component.css',
})
export class AllSpecailtiesComponent implements OnInit {
  constructor(
    readonly specialtiesService: SpecialtiesService,
    readonly localStorageService: LocalstorageService,
    readonly route: Router,
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
