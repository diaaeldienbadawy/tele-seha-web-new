import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { LocalstorageService } from '../../../../core/services/localstorage.service';

@Component({
  selector: 'app-doctor-hero-section-home-page',
  imports: [],
  templateUrl: './doctor-hero-section-home-page.component.html',
  styleUrl: './doctor-hero-section-home-page.component.css',
})
export class DoctorHeroSectionHomePageComponent implements OnInit {
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
      });
    }

    if (this.role === 'Doctor') {
      this.localStorageService.doctorName$.subscribe((name) => {
        this.name = name;
      });
    }
  }
}
