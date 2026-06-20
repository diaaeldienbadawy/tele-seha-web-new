import { Component } from '@angular/core';
import { SpecailtiesHeroSectionComponent } from "../../specialites-landing-page/specailties-hero-section/specailties-hero-section.component";
import { AllSpecailtiesComponent } from "../../specialites-landing-page/all-specailties/all-specailties.component";
import { FooterComponent } from "../../../../layouts/footer/footer.component";
import { HeaderComponent } from "../../../../layouts/header/header.component";

@Component({
  selector: 'app-all-specailties-landing-page',
  imports: [SpecailtiesHeroSectionComponent, AllSpecailtiesComponent, FooterComponent, HeaderComponent],
  templateUrl: './all-specailties-landing-page.component.html',
  styleUrl: './all-specailties-landing-page.component.css'
})
export class AllSpecailtiesLandingPageComponent {

}
