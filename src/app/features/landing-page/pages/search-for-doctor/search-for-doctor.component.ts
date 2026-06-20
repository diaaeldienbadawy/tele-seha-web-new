import { Component } from '@angular/core';
import { SearchForDoctorHeroSectionComponent } from "../../search-for-doctor/search-for-doctor-hero-section/search-for-doctor-hero-section.component";
import { SearchForDoctorAllDoctorComponent } from "../../search-for-doctor/search-for-doctor-all-doctor/search-for-doctor-all-doctor.component";
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { FooterComponent } from "../../../../layouts/footer/footer.component";

@Component({
  selector: 'app-search-for-doctor',
  imports: [SearchForDoctorHeroSectionComponent, SearchForDoctorAllDoctorComponent, HeaderComponent, FooterComponent],
  templateUrl: './search-for-doctor.component.html',
  styleUrl: './search-for-doctor.component.css'
})
export class SearchForDoctorComponent {

}
