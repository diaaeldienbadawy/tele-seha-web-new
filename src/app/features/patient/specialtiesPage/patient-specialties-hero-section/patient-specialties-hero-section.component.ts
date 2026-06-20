import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-patient-specialties-hero-section',
  imports: [RouterLink, TranslateModule],
  templateUrl: './patient-specialties-hero-section.component.html',
  styleUrl: './patient-specialties-hero-section.component.css',
})
export class PatientSpecialtiesHeroSectionComponent {}
