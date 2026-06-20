import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-patient-hero-section',
  imports: [RouterLink, TranslateModule],
  templateUrl: './patient-hero-section.component.html',
  styleUrl: './patient-hero-section.component.css',
})
export class PatientHeroSectionComponent implements OnInit {
  name = '';
  doctorName = '';
  role: string = '';

  readonly platformId = inject(PLATFORM_ID);

  constructor(readonly localStorageService: LocalstorageService) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.role = this.localStorageService.get('role') ?? '';

    if (this.role === 'Patient') {
      this.localStorageService.patientName$.subscribe((name) => {
        this.name = name;
        console.log('Patient Name:', name);
      });
    }

    if (this.role === 'Doctor') {
      this.localStorageService.doctorName$.subscribe((name) => {
        this.name = name;
        console.log('Doctor Name:', name);
      });
    }
  }
}
