import { Component } from '@angular/core';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { SearchForDoctorHeroSectionComponent } from "../../search-for-doctor/search-for-doctor-hero-section/search-for-doctor-hero-section.component";
import { FooterComponent } from "../../../../layouts/footer/footer.component";
import { LandingPageForDoctorsComponent } from "../../home/landing-page-for-doctors/landing-page-for-doctors.component";
import { LandingPageFullClinicComponent } from "../../home/landing-page-full-clinic/landing-page-full-clinic.component";
import { LandingPageStartSeeingComponent } from "../../home/landing-page-start-seeing/landing-page-start-seeing.component";

@Component({
  selector: 'app-for-doctor',
  imports: [HeaderComponent, SearchForDoctorHeroSectionComponent, FooterComponent, LandingPageForDoctorsComponent, LandingPageFullClinicComponent, LandingPageStartSeeingComponent],
  templateUrl: './for-doctor.component.html',
  styleUrl: './for-doctor.component.css'
})
export class ForDoctorComponent {

}
