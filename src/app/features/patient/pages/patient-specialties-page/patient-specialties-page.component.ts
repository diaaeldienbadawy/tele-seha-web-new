import { Component } from '@angular/core';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { FooterComponent } from "../../../../layouts/footer/footer.component";
import { PatientSpecialtiesHeroSectionComponent } from "../../specialtiesPage/patient-specialties-hero-section/patient-specialties-hero-section.component";
import { PatientAllSpecialtiesSectionComponent } from "../../specialtiesPage/patient-all-specialties-section/patient-all-specialties-section.component";

@Component({
  selector: 'app-patient-specialties-page',
  imports: [HeaderComponent, FooterComponent, PatientSpecialtiesHeroSectionComponent, PatientAllSpecialtiesSectionComponent],
  templateUrl: './patient-specialties-page.component.html',
  styleUrl: './patient-specialties-page.component.css'
})
export class PatientSpecialtiesPageComponent {

}
